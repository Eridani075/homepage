const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// IP Failures and Blacklisting state
const ipFailures = new Map();
const blacklistedIps = new Set();

// Helper to get client IP (supporting reverse proxies)
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress;
};

// Global IP Blacklist middleware
app.use((req, res, next) => {
    const ip = getClientIp(req);
    if (blacklistedIps.has(ip)) {
        return res.status(403).send('Access denied: Your IP has been blacklisted.');
    }
    next();
});

// Enable CORS with origin restrictions to prevent unauthorized cross-origin requests
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
        if (!origin) {
            return callback(null, true);
        }
        try {
            const url = new URL(origin);
            // Allow localhost, 127.0.0.1, and local private network subnets (192.168.x.x, 10.x.x.x, 172.16.x.x to 172.31.x.x)
            if (
                url.hostname === 'localhost' || 
                url.hostname === '127.0.0.1' || 
                url.hostname.startsWith('192.168.') || 
                url.hostname.startsWith('10.') ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(url.hostname)
            ) {
                return callback(null, true);
            }
        } catch (e) {}
        // Fail other cross-origin requests
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};
app.use(cors(corsOptions));

// Parse JSON request body
app.use(express.json({ limit: '50mb' }));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Generate Dynamic In-Memory API Key (Valid for 12 hours, saved to session file)
const KEY_FILE = path.join(DATA_DIR, 'current_key.txt');
let API_KEY = crypto.randomBytes(16).toString('hex');
const KEY_LIFETIME = 12 * 60 * 60 * 1000; // 12 hours
let keyCreatedAt = Date.now();

// Initial write of the key
try {
    fs.writeFileSync(KEY_FILE, API_KEY, 'utf8');
    fs.chmodSync(KEY_FILE, 0o600); // Owner read-only
} catch (e) {
    console.error('Failed to write current_key.txt:', e);
}

// Key rotation check
const checkAndRotateKey = () => {
    if (Date.now() - keyCreatedAt > KEY_LIFETIME) {
        API_KEY = crypto.randomBytes(16).toString('hex');
        keyCreatedAt = Date.now();
        try {
            fs.writeFileSync(KEY_FILE, API_KEY, 'utf8');
            fs.chmodSync(KEY_FILE, 0o600);
            console.log(`[AUTH] API Key expired and rotated. New key (masked): ${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}`);
        } catch (e) {
            console.error('Failed to write rotated current_key.txt:', e);
        }
    }
};

// Auth helper functions
const handleAuthFailure = (req) => {
    const ip = getClientIp(req);
    const count = (ipFailures.get(ip) || 0) + 1;
    ipFailures.set(ip, count);
    if (count >= 5) {
        blacklistedIps.add(ip);
        console.warn(`[AUTH] IP ${ip} blacklisted due to 5+ failed auth attempts.`);
    }
};

const handleAuthSuccess = (req) => {
    const ip = getClientIp(req);
    ipFailures.delete(ip);
    keyCreatedAt = Date.now(); // Sliding Session Expiration: Reset expiration window on successful API interaction
};

// Unified validation helper to prevent code duplication
const verifyToken = (token, req) => {
    checkAndRotateKey();
    if (token && token === API_KEY) {
        handleAuthSuccess(req);
        return true;
    } else {
        handleAuthFailure(req);
        return false;
    }
};

// Auth middleware for POST/write endpoints
const requireAuth = (req, res, next) => {
    const token = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!verifyToken(token, req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const prefix = req.path.includes('wallpaper') ? 'wallpaper' : 'avatar';
        const rawExt = path.extname(file.originalname).toLowerCase();
        // Strict alphanumeric extension filtering to prevent command injection
        const ext = /^\.[a-z0-9]+$/.test(rawExt) ? rawExt : '.bin';
        cb(null, `${prefix}_${Date.now()}${ext}`);
    }
});

// File validation filter
const fileFilter = (req, file, cb) => {
    const isWallpaper = req.path.includes('wallpaper');
    const mimetype = file.mimetype.toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase();

    if (isWallpaper) {
        const allowedImgMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const allowedImgExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const allowedVidMimes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/avi'];
        const allowedVidExts = ['.mp4', '.mov', '.mkv', '.webm', '.avi'];

        if ((allowedImgMimes.includes(mimetype) && allowedImgExts.includes(ext)) ||
            (allowedVidMimes.includes(mimetype) && allowedVidExts.includes(ext))) {
            cb(null, true);
        } else {
            cb(new Error('Invalid wallpaper file type. Only standard images and videos are allowed.'));
        }
    } else {
        const allowedImgMimes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedImgExts = ['.jpg', '.jpeg', '.png', '.webp'];

        if (allowedImgMimes.includes(mimetype) && allowedImgExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid avatar file type. Only JPG, PNG, and WebP are allowed.'));
        }
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // Limit to 100MB
    }
});

// Helper to delete previous uploaded files of a certain type
const deletePreviousFiles = (prefix) => {
    try {
        if (fs.existsSync(UPLOADS_DIR)) {
            const files = fs.readdirSync(UPLOADS_DIR);
            files.forEach(file => {
                if (file.startsWith(prefix)) {
                    fs.unlinkSync(path.join(UPLOADS_DIR, file));
                }
            });
        }
    } catch (e) {
        console.error(`Error deleting previous files for prefix ${prefix}:`, e);
    }
};

// Transcode video to H.264 MP4 with superfast preset and no audio using execFile
const transcodeVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const args = [
            '-y',
            '-i', inputPath,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-preset', 'superfast',
            '-crf', '23',
            '-an',
            outputPath
        ];
        execFile('ffmpeg', args, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
};



// API Endpoints

// 1. Get configuration
app.get('/api/config', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return res.json(JSON.parse(data));
        } catch (e) {
            console.error('Error parsing config.json:', e);
            return res.status(500).json({ error: 'Config file is corrupted' });
        }
    } else {
        // Return empty configuration so frontend uses its defaults
        return res.json({});
    }
});

// Verification endpoint for admin authentication
app.post('/api/verify-key', (req, res) => {
    const { key } = req.body;
    if (verifyToken(key, req)) {
        return res.json({ success: true });
    } else {
        return res.status(401).json({ error: 'Invalid API Key' });
    }
});

// 2. Save configuration (requires authorization)
app.post('/api/config', requireAuth, (req, res) => {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2), 'utf8');
        return res.json({ success: true });
    } catch (e) {
        console.error('Error saving config.json:', e);
        return res.status(500).json({ error: 'Failed to write config file' });
    }
});

// 3. Upload Wallpaper (requires authorization & handles file validation errors)
app.post('/api/upload/wallpaper', requireAuth, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const isVideo = req.file.mimetype.startsWith('video');
    let finalFilename = req.file.filename;

    if (isVideo) {
        const ext = '.mp4'; // Always transcode to mp4 container
        finalFilename = `wallpaper_h264_${Date.now()}${ext}`;
        const outputPath = path.join(UPLOADS_DIR, finalFilename);

        try {
            await transcodeVideo(inputPath, outputPath);
            // Delete the original uploaded file (temp)
            fs.unlinkSync(inputPath);
        } catch (err) {
            console.error('Failed to transcode video, falling back to original:', err);
            // If transcoding fails, we keep the original file
            finalFilename = req.file.filename;
        }
    }

    // Clean up old wallpapers
    try {
        const files = fs.readdirSync(UPLOADS_DIR);
        files.forEach(file => {
            if (file.startsWith('wallpaper_') && file !== finalFilename) {
                fs.unlinkSync(path.join(UPLOADS_DIR, file));
            }
        });
    } catch (e) {
        console.error('Error cleaning old wallpapers:', e);
    }

    const relativeUrl = `/api/uploads/${finalFilename}`;
    return res.json({ url: relativeUrl });
});

// 4. Upload Avatar (requires authorization & handles file validation errors)
app.post('/api/upload/avatar', requireAuth, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Clean up old avatars
    const currentFilename = req.file.filename;
    try {
        const files = fs.readdirSync(UPLOADS_DIR);
        files.forEach(file => {
            if (file.startsWith('avatar_') && file !== currentFilename) {
                fs.unlinkSync(path.join(UPLOADS_DIR, file));
            }
        });
    } catch (e) {
        console.error('Error cleaning old avatars:', e);
    }

    const relativeUrl = `/api/uploads/${currentFilename}`;
    return res.json({ url: relativeUrl });
});

// 5. Reset Wallpaper (requires authorization)
app.post('/api/reset/wallpaper', requireAuth, (req, res) => {
    deletePreviousFiles('wallpaper_');
    return res.json({ success: true });
});

// 6. Reset Avatar (requires authorization)
app.post('/api/reset/avatar', requireAuth, (req, res) => {
    deletePreviousFiles('avatar_');
    return res.json({ success: true });
});

// Uptime Kuma API Proxy endpoint
app.get('/kuma-api/status-page/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // 1. Strict validation of slug to prevent path traversal
        if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
            return res.status(400).json({ error: 'Invalid status page slug format' });
        }

        // 2. Load and normalize kumaUrl (environment variable takes precedence)
        let kumaUrl = process.env.KUMA_URL || 'http://localhost:3001';
        if (!process.env.KUMA_URL && fs.existsSync(CONFIG_FILE)) {
            try {
                const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
                if (config.kumaUrl) kumaUrl = config.kumaUrl;
            } catch (e) {}
        }
        
        let baseUrl = kumaUrl.trim();
        if (!/^https?:\/\//i.test(baseUrl)) {
            baseUrl = 'http://' + baseUrl;
        }

        // 3. Parse and validate base URL
        let parsedBase;
        try {
            parsedBase = new URL(baseUrl);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid Kuma URL format' });
        }

        if (parsedBase.protocol !== 'http:' && parsedBase.protocol !== 'https:') {
            return res.status(400).json({ error: 'Invalid URL protocol' });
        }

        // 4. Construct target URL relative to origin and sanitize
        const targetUrl = new URL(`/api/status-page/${slug}`, parsedBase.origin);
        
        // Prevent basic credentials injection (e.g. user:pass@host)
        if (targetUrl.username || targetUrl.password) {
            return res.status(400).json({ error: 'URL credentials are not allowed' });
        }

        const response = await fetch(targetUrl.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: `Uptime Kuma responded with status ${response.status}` });
        }
        
        const data = await response.json();
        return res.json(data);
    } catch (err) {
        console.error('[Kuma Proxy] Error:', err);
        return res.status(500).json({ error: `Failed to connect to Uptime Kuma: ${err.message}` });
    }
});

// Static routes
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Serve Vite production output (dist/) in production
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
    // Disable caching for index.html so updates are loaded immediately
    app.use(express.static(DIST_DIR, {
        setHeaders: (res, filePath) => {
            if (path.basename(filePath) === 'index.html') {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            }
        }
    }));
    // Serve index.html for React SPA router support
    app.use((req, res, next) => {
        // Exclude API requests
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Config path: ${CONFIG_FILE}`);
    console.log(`Uploads path: ${UPLOADS_DIR}`);
    if (API_KEY) {
        console.log(`[AUTH] Dynamic API security key enabled.`);
        console.log(`[AUTH] Key value (masked): ${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}`);
        console.log(`[AUTH] Full key is saved in: ${KEY_FILE}`);
        console.log(`[AUTH] Tip: Run 'cat ${KEY_FILE}' on host to view the full key.`);
        console.log(`[AUTH] Lifetime: 12 hours (expires at ${new Date(keyCreatedAt + KEY_LIFETIME).toLocaleTimeString()})`);
    }
});
