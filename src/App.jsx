import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import HeroSection from './components/HeroSection';
import AppGrid from './components/AppGrid';
import AdminModal from './components/AdminModal';
import TopBar from './components/TopBar';
import localforage from 'localforage';
import { 
    Hct, 
    SchemeTonalSpot, 
    SchemeVibrant, 
    SchemeExpressive, 
    SchemeFruitSalad, 
    SchemeRainbow, 
    hexFromArgb, 
    argbFromHex,
    themeFromImage
} from '@material/material-color-utilities';

const hexToRgba = (hex, alpha) => {
    if (!hex || hex.length !== 7) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const readStorage = (key, fallback = null) => {
    if (typeof window === 'undefined') return fallback;
    try {
        const value = window.localStorage.getItem(key);
        return value ?? fallback;
    } catch (e) {
        return fallback;
    }
};

export default function App() {
    const [isDark, setIsDark] = useState(() => readStorage('theme-mode', 'light') === 'dark');
    const [adminActive, setAdminActive] = useState(false);
    const [activeTab, setActiveTab] = useState('layout'); // 'palette', 'style', 'layout'
    const [socialLinks, setSocialLinks] = useState(() => {
        const defaults = [
            { id: '1', icon: 'FaGithub', title: 'GitHub', url: 'https://github.com' },
            { id: '2', icon: 'FaXTwitter', title: 'X (Twitter)', url: 'https://twitter.com' },
            { id: '3', icon: 'FaYoutube', title: 'YouTube', url: 'https://youtube.com' },
            { id: '4', icon: 'Mail', title: 'Contact Me', url: 'mailto:hello@example.com' }
        ];
        try {
            const savedSocial = readStorage('dashboard-social-links');
            return savedSocial ? JSON.parse(savedSocial) : defaults;
        } catch (e) {
            return defaults;
        }
    });
    const [themeStyle, setThemeStyle] = useState(() => readStorage('theme-style', 'TONAL_SPOT'));
    const [baseColor, setBaseColor] = useState(() => readStorage('theme-color', '#6200EE'));
    const [mediaUrl, setMediaUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [heroStyle, setHeroStyle] = useState(() => readStorage('hero-style', 'card')); // 'card' or 'minimal'
    const [isEditMode, setIsEditMode] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [brandTitle, setBrandTitle] = useState(() => readStorage('dashboard-title', '控制台'));
    const [brandSubtitle, setBrandSubtitle] = useState(() => readStorage('dashboard-subtitle', '家庭数据中心'));
    const [username, setUsername] = useState(() => readStorage('dashboard-username', 'Administrator'));
    const [personalSign, setPersonalSign] = useState(() => readStorage('dashboard-signature', '这里是你的数字花园与个人基础设施网关。所有的应用服务都在安全运行中，随时准备好为你服务。'));
    const [kumaUrl, setKumaUrl] = useState(() => readStorage('kuma-url', 'http://localhost:3001'));
    const [kumaSlug, setKumaSlug] = useState(() => readStorage('kuma-slug', 'default'));
    
    // Background Overlay Settings
    const [enableBgOverlay, setEnableBgOverlay] = useState(() => readStorage('bg-overlay-enable', 'true') === 'true');
    const [bgOverlayFollowsTheme, setBgOverlayFollowsTheme] = useState(() => readStorage('bg-overlay-follows-theme', 'false') === 'true');
    const [bgOverlayBlur, setBgOverlayBlur] = useState(() => Number(readStorage('bg-overlay-blur', '8')));
    const [activeScheme, setActiveScheme] = useState(null);
    const [apiKey, setApiKey] = useState(() => readStorage('api-key', ''));
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);

    useEffect(() => {
        localStorage.setItem('api-key', apiKey);
    }, [apiKey]);

    const [showAdminPill, setShowAdminPill] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isAdminParam = params.get('admin') === '1' || params.get('admin') === 'true';
        const hasStoredKey = !!localStorage.getItem('api-key');

        const verifyKey = async (key) => {
            try {
                const response = await fetch('/api/verify-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key })
                });
                if (response.ok) {
                    setApiKey(key);
                    localStorage.setItem('api-key', key);
                    setShowAdminPill(true);
                    return true;
                } else if (response.status === 403) {
                    alert('访问被拒绝：您的 IP 已被拉黑！');
                    window.location.href = 'about:blank';
                    return false;
                } else {
                    alert('密钥验证失败！');
                    localStorage.removeItem('api-key');
                    setShowAdminPill(false);
                    return false;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        };

        if (isAdminParam) {
            // Remove parameter from URL to keep it clean
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);

            const promptAndVerify = async () => {
                const enteredKey = prompt('请输入管理员 API 安全密钥 (API Key):');
                if (enteredKey) {
                    await verifyKey(enteredKey);
                } else {
                    alert('拒绝访问：未提供密钥');
                    setShowAdminPill(false);
                }
            };
            promptAndVerify();
        } else if (hasStoredKey) {
            const storedKey = localStorage.getItem('api-key');
            fetch('/api/verify-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: storedKey })
            }).then(res => {
                if (res.ok) {
                    setShowAdminPill(true);
                } else {
                    localStorage.removeItem('api-key');
                    setShowAdminPill(false);
                }
            }).catch(() => {
                localStorage.removeItem('api-key');
                setShowAdminPill(false);
            });
        }
    }, []);
    
    const defaultCards = [
        { id: '1', title: '个人博客', desc: '数字花园、笔记、技术教程与开发日志库。', iconName: 'Globe', showUptime: true },
        { id: '2', title: '路由器控制台', desc: 'OpenWrt 智能家庭网关与网络流量管控面板。', iconName: 'Server', showUptime: true },
        { id: '3', title: 'FRP 内网穿透', desc: '外部公网访问本地开发环境与服务的隧道管理。', iconName: 'Box', showUptime: true },
        { id: '4', title: '监控中心 (Grafana)', desc: '探针看板、Docker 容器监控及服务器性能数据。', iconName: 'Settings', showUptime: true },
        { id: '5', title: '私人云盘', desc: 'Nextcloud 数据中心、跨设备文件同步与照片备份。', iconName: 'Database', showUptime: true },
    ];
    const [cards, setCards] = useState(() => {
        try {
            const savedCards = readStorage('dashboard-cards');
            return savedCards ? JSON.parse(savedCards) : defaultCards;
        } catch (e) {
            return defaultCards;
        }
    });

    // Helper to load localStorage fallbacks
    const loadLocalFallback = async () => {
        const savedMode = localStorage.getItem('theme-mode') || 'light';
        setIsDark(savedMode === 'dark');

        const savedStyle = localStorage.getItem('theme-style') || 'TONAL_SPOT';
        setThemeStyle(savedStyle);

        const savedColor = localStorage.getItem('theme-color');
        if (savedColor) setBaseColor(savedColor);

        const savedHeroStyle = localStorage.getItem('hero-style');
        if (savedHeroStyle) setHeroStyle(savedHeroStyle);

        const savedTitle = localStorage.getItem('dashboard-title');
        if (savedTitle) setBrandTitle(savedTitle);

        const savedSubtitle = localStorage.getItem('dashboard-subtitle');
        if (savedSubtitle) setBrandSubtitle(savedSubtitle);

        const savedUsername = localStorage.getItem('dashboard-username');
        if (savedUsername) setUsername(savedUsername);

        const savedSignature = localStorage.getItem('dashboard-signature');
        if (savedSignature) setPersonalSign(savedSignature);

        const savedEnableOverlay = localStorage.getItem('bg-overlay-enable');
        if (savedEnableOverlay !== null) setEnableBgOverlay(savedEnableOverlay === 'true');

        const savedOverlayTheme = localStorage.getItem('bg-overlay-follows-theme');
        if (savedOverlayTheme !== null) setBgOverlayFollowsTheme(savedOverlayTheme === 'true');

        const savedOverlayBlur = localStorage.getItem('bg-overlay-blur');
        if (savedOverlayBlur !== null) setBgOverlayBlur(Number(savedOverlayBlur));

        const savedKumaUrl = localStorage.getItem('kuma-url');
        if (savedKumaUrl) setKumaUrl(savedKumaUrl);

        const savedKumaSlug = localStorage.getItem('kuma-slug');
        if (savedKumaSlug) setKumaSlug(savedKumaSlug);

        const savedCards = localStorage.getItem('dashboard-cards');
        if (savedCards) {
            try {
                setCards(JSON.parse(savedCards));
            } catch(e) {}
        }

        const savedSocial = localStorage.getItem('dashboard-social-links');
        if (savedSocial) {
            try {
                setSocialLinks(JSON.parse(savedSocial));
            } catch(e) {}
        }

        const mediaBlob = await localforage.getItem('custom-media');
        if (mediaBlob) {
            const url = URL.createObjectURL(mediaBlob);
            setMediaUrl(url);
            setMediaType(mediaBlob.type.startsWith('video') ? 'video' : 'image');
        }

        const avatarBlob = await localforage.getItem('custom-avatar');
        if (avatarBlob) {
            const url = URL.createObjectURL(avatarBlob);
            setAvatarUrl(url);
        }
    };

    // Load configuration on mount
    useEffect(() => {
        const loadConfiguration = async () => {
            try {
                const response = await fetch(`/api/config?t=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('API server not available');
                const config = await response.json();
                
                if (Object.keys(config).length === 0) {
                    await loadLocalFallback();
                    return;
                }

                if (config.isDark !== undefined) setIsDark(config.isDark);
                if (config.themeStyle !== undefined) setThemeStyle(config.themeStyle);
                if (config.baseColor !== undefined) setBaseColor(config.baseColor);
                if (config.heroStyle !== undefined) setHeroStyle(config.heroStyle);
                if (config.brandTitle !== undefined) setBrandTitle(config.brandTitle);
                if (config.brandSubtitle !== undefined) setBrandSubtitle(config.brandSubtitle);
                if (config.enableBgOverlay !== undefined) setEnableBgOverlay(config.enableBgOverlay);
                if (config.bgOverlayFollowsTheme !== undefined) setBgOverlayFollowsTheme(config.bgOverlayFollowsTheme);
                if (config.bgOverlayBlur !== undefined) setBgOverlayBlur(config.bgOverlayBlur);
                if (config.cards !== undefined) setCards(config.cards);
                if (config.socialLinks !== undefined) setSocialLinks(config.socialLinks);
                if (config.username !== undefined) setUsername(config.username);
                if (config.personalSign !== undefined) setPersonalSign(config.personalSign);
                if (config.kumaUrl !== undefined) setKumaUrl(config.kumaUrl);
                if (config.kumaSlug !== undefined) setKumaSlug(config.kumaSlug);

                if (config.mediaUrl) {
                    setMediaUrl(config.mediaUrl);
                    setMediaType(config.mediaType || (config.mediaUrl.endsWith('.mp4') ? 'video' : 'image'));
                } else {
                    // fall back to localforage custom-media if server has no custom wallpaper
                    const mediaBlob = await localforage.getItem('custom-media');
                    if (mediaBlob) {
                        const url = URL.createObjectURL(mediaBlob);
                        setMediaUrl(url);
                        setMediaType(mediaBlob.type.startsWith('video') ? 'video' : 'image');
                    }
                }

                if (config.avatarUrl) {
                    setAvatarUrl(config.avatarUrl);
                } else {
                    // fall back to localforage custom-avatar
                    const avatarBlob = await localforage.getItem('custom-avatar');
                    if (avatarBlob) {
                        const url = URL.createObjectURL(avatarBlob);
                        setAvatarUrl(url);
                    }
                }
            } catch (e) {
                console.warn('Backend configuration failed to load, falling back to browser storage:', e);
                await loadLocalFallback();
            } finally {
                setIsConfigLoaded(true);
            }
        };

        loadConfiguration();
    }, []);

    // Revoke previous mediaUrl when it changes or unmounts to prevent memory leaks
    useEffect(() => {
        return () => {
            if (mediaUrl && !mediaUrl.startsWith('/api/')) {
                URL.revokeObjectURL(mediaUrl);
            }
        };
    }, [mediaUrl]);

    // Revoke previous avatarUrl when it changes or unmounts to prevent memory leaks
    useEffect(() => {
        return () => {
            if (avatarUrl && !avatarUrl.startsWith('/api/')) {
                URL.revokeObjectURL(avatarUrl);
            }
        };
    }, [avatarUrl]);

    // Apply Material Theme before paint to avoid a default-theme flash on refresh.
    useLayoutEffect(() => {
        const root = document.documentElement;
        document.body.classList.add('theme-switching');
        
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        applyMaterialTheme(baseColor, isDark, themeStyle);

        const timer = setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 50);

        return () => clearTimeout(timer);
    }, [isDark, baseColor, themeStyle]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--card-blur', `${Math.max(0, 16 - bgOverlayBlur)}px`);
    }, [bgOverlayBlur]);

    // Keep track of latest config for keepalive saves on unload
    const configRef = useRef();
    const hasUnsavedChanges = useRef(false);
    const isFirstRun = useRef(true);

    useEffect(() => {
        configRef.current = {
            isDark,
            themeStyle,
            baseColor,
            heroStyle,
            brandTitle,
            brandSubtitle,
            enableBgOverlay,
            bgOverlayFollowsTheme,
            bgOverlayBlur,
            cards,
            socialLinks,
            username,
            personalSign,
            mediaUrl: (mediaUrl && mediaUrl.startsWith('blob:')) ? null : mediaUrl,
            mediaType,
            avatarUrl: (avatarUrl && avatarUrl.startsWith('blob:')) ? null : avatarUrl,
            kumaUrl,
            kumaSlug
        };
        if (isConfigLoaded && !isFirstRun.current) {
            hasUnsavedChanges.current = true;
        }
    }, [
        isDark, themeStyle, baseColor, heroStyle, brandTitle, brandSubtitle, enableBgOverlay,
        bgOverlayFollowsTheme, bgOverlayBlur, cards, socialLinks, username, personalSign,
        mediaUrl, mediaType, avatarUrl, kumaUrl, kumaSlug, isConfigLoaded
    ]);

    // Save on tab close
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (hasUnsavedChanges.current && configRef.current) {
                const cfg = configRef.current;
                localStorage.setItem('theme-mode', cfg.isDark ? 'dark' : 'light');
                localStorage.setItem('theme-style', cfg.themeStyle);
                localStorage.setItem('theme-color', cfg.baseColor);
                localStorage.setItem('hero-style', cfg.heroStyle);
                localStorage.setItem('dashboard-title', cfg.brandTitle);
                localStorage.setItem('dashboard-subtitle', cfg.brandSubtitle);
                localStorage.setItem('dashboard-username', cfg.username);
                localStorage.setItem('dashboard-signature', cfg.personalSign);
                localStorage.setItem('bg-overlay-enable', String(cfg.enableBgOverlay));
                localStorage.setItem('bg-overlay-follows-theme', String(cfg.bgOverlayFollowsTheme));
                localStorage.setItem('bg-overlay-blur', String(cfg.bgOverlayBlur));
                localStorage.setItem('kuma-url', cfg.kumaUrl);
                localStorage.setItem('kuma-slug', cfg.kumaSlug);
                localStorage.setItem('dashboard-cards', JSON.stringify(cfg.cards));
                localStorage.setItem('dashboard-social-links', JSON.stringify(cfg.socialLinks));

                // Sync to server config via keepalive fetch
                const savedApiKey = localStorage.getItem('api-key') || '';
                if (!savedApiKey) {
                    return;
                }
                fetch('/api/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': savedApiKey
                    },
                    body: JSON.stringify(cfg),
                    keepalive: true
                }).catch(() => {});
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Unified debounced saving to Server & LocalStorage
    useEffect(() => {
        if (!isConfigLoaded) {
            return;
        }

        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const cleanMediaUrl = (mediaUrl && mediaUrl.startsWith('blob:')) ? null : mediaUrl;
            const cleanAvatarUrl = (avatarUrl && avatarUrl.startsWith('blob:')) ? null : avatarUrl;

            const config = {
                isDark,
                themeStyle,
                baseColor,
                heroStyle,
                brandTitle,
                brandSubtitle,
                enableBgOverlay,
                bgOverlayFollowsTheme,
                bgOverlayBlur,
                cards,
                socialLinks,
                username,
                personalSign,
                mediaUrl: cleanMediaUrl,
                mediaType,
                avatarUrl: cleanAvatarUrl,
                kumaUrl,
                kumaSlug
            };

            // Sync to LocalStorage as fallback
            localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
            localStorage.setItem('theme-style', themeStyle);
            localStorage.setItem('theme-color', baseColor);
            localStorage.setItem('hero-style', heroStyle);
            localStorage.setItem('dashboard-title', brandTitle);
            localStorage.setItem('dashboard-subtitle', brandSubtitle);
            localStorage.setItem('dashboard-username', username);
            localStorage.setItem('dashboard-signature', personalSign);
            localStorage.setItem('bg-overlay-enable', String(enableBgOverlay));
            localStorage.setItem('bg-overlay-follows-theme', String(bgOverlayFollowsTheme));
            localStorage.setItem('bg-overlay-blur', String(bgOverlayBlur));
            localStorage.setItem('kuma-url', kumaUrl);
            localStorage.setItem('kuma-slug', kumaSlug);
            localStorage.setItem('dashboard-cards', JSON.stringify(cards));
            localStorage.setItem('dashboard-social-links', JSON.stringify(socialLinks));

            // Skip server sync if no API key is configured
            if (!apiKey) {
                return;
            }

            // Sync to server config
            fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify(config)
            }).then(res => {
                if (res.status === 401) {
                    console.warn('API Key unauthorized. Please check settings.');
                } else if (res.ok) {
                    hasUnsavedChanges.current = false;
                }
            }).catch(err => {
                console.warn('Failed to sync configuration to server:', err);
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [
        isDark,
        themeStyle,
        baseColor,
        heroStyle,
        brandTitle,
        brandSubtitle,
        enableBgOverlay,
        bgOverlayFollowsTheme,
        bgOverlayBlur,
        cards,
        socialLinks,
        username,
        personalSign,
        mediaUrl,
        mediaType,
        avatarUrl,
        kumaUrl,
        kumaSlug,
        isConfigLoaded
    ]);

    const applyMaterialTheme = (hex, dark, style) => {
        const argb = argbFromHex(hex);
        const hct = Hct.fromInt(argb);
        let scheme;
        switch(style) {
            case 'VIBRANT': scheme = new SchemeVibrant(hct, dark, 0); break;
            case 'EXPRESSIVE': scheme = new SchemeExpressive(hct, dark, 0); break;
            case 'RAINBOW': scheme = new SchemeRainbow(hct, dark, 0); break;
            case 'FRUIT_SALAD': scheme = new SchemeFruitSalad(hct, dark, 0); break;
            default: scheme = new SchemeTonalSpot(hct, dark, 0); break;
        }
        setActiveScheme(scheme);

        const root = document.documentElement;
        // Direct override of active theme variables
        root.style.setProperty('--bg', hexFromArgb(scheme.surface));
        root.style.setProperty('--text-main', hexFromArgb(scheme.onSurface));
        root.style.setProperty('--text-variant', hexFromArgb(scheme.onSurfaceVariant));
        root.style.setProperty('--card-bg', hexFromArgb(scheme.surfaceVariant));
        root.style.setProperty('--primary', hexFromArgb(scheme.primary));
        root.style.setProperty('--on-primary', hexFromArgb(scheme.onPrimary));
        root.style.setProperty('--primary-container', hexFromArgb(scheme.primaryContainer));
        root.style.setProperty('--on-primary-container', hexFromArgb(scheme.onPrimaryContainer));
        root.style.setProperty('--secondary-container', hexFromArgb(scheme.secondaryContainer));
        root.style.setProperty('--on-secondary-container', hexFromArgb(scheme.onSecondaryContainer));
        root.style.setProperty('--outline', hexFromArgb(scheme.outline));
        root.style.setProperty('--outline-variant', hexFromArgb(scheme.outlineVariant));
        root.style.setProperty('--surface-variant', hexFromArgb(scheme.surfaceVariant));
        root.style.setProperty('--surface-container-highest', hexFromArgb(scheme.surfaceVariant)); // Fallback for M3 Container
    };

    const extractColorFromImage = async (url) => {
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Failed to load image for extraction'));
            });
            
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 128;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
            } else {
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            }
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const smallImg = new Image();
            await new Promise((resolve, reject) => {
                smallImg.onload = resolve;
                smallImg.onerror = () => reject(new Error('Failed to load data URL image'));
                smallImg.src = canvas.toDataURL();
            });

            const theme = await themeFromImage(smallImg);
            const extractedHex = hexFromArgb(theme.source);
            setBaseColor(extractedHex);
            
            // Clean references
            smallImg.onload = null;
            smallImg.onerror = null;
            img.onload = null;
            img.onerror = null;
        } catch (e) {
            console.error('Failed to extract color from image:', e);
        }
    };

    const extractColorFromVideo = (url) => {
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        const cleanup = () => {
            video.pause();
            video.src = "";
            video.load();
        };

        video.play().then(() => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 128;
            let width = video.videoWidth;
            let height = video.videoHeight;
            if (width > height) {
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
            } else {
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            }
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const smallImg = new Image();
            smallImg.onload = async () => {
                try {
                    const theme = await themeFromImage(smallImg);
                    const extractedHex = hexFromArgb(theme.source);
                    setBaseColor(extractedHex);
                } catch (e) {
                    console.error('Failed to extract theme from video frame:', e);
                } finally {
                    smallImg.onload = null;
                    smallImg.onerror = null;
                    cleanup();
                }
            };
            smallImg.onerror = () => {
                console.error('Failed to load video canvas image');
                smallImg.onload = null;
                smallImg.onerror = null;
                cleanup();
            };
            smallImg.src = canvas.toDataURL();
        }).catch(err => {
            console.error('Failed to play video for color extraction:', err);
            cleanup();
        });
    };

    const handleMediaUpload = async (file) => {
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        setMediaUrl(localUrl);
        
        const isVideo = file.type.startsWith('video');
        setMediaType(isVideo ? 'video' : 'image');

        await localforage.setItem('custom-media', file);

        if (isVideo) {
            extractColorFromVideo(localUrl);
        } else {
            extractColorFromImage(localUrl);
        }

        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload/wallpaper', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey
                },
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                setMediaUrl(data.url);
            } else if (response.status === 401) {
                alert('API 密钥无效，请在设置面板中配置正确的密钥！');
            } else {
                const data = await response.json();
                alert('上传失败: ' + (data.error || '未知错误'));
            }
        } catch (e) {
            console.warn('Failed to upload wallpaper to server, using local blob:', e);
        }
    };

    const handleResetMedia = async () => {
        setMediaUrl(null);
        setMediaType(null);
        await localforage.removeItem('custom-media');
        
        try {
            const response = await fetch('/api/reset/wallpaper', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey
                }
            });
            if (response.status === 401) {
                alert('API 密钥无效，请在设置面板中配置正确的密钥！');
            }
        } catch (e) {
            console.warn('Failed to reset wallpaper on server:', e);
        }
    };

    const handleAvatarUpload = async (file) => {
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        await localforage.setItem('custom-avatar', file);

        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey
                },
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                setAvatarUrl(data.url);
            } else if (response.status === 401) {
                alert('API 密钥无效，请在设置面板中配置正确的密钥！');
            } else {
                const data = await response.json();
                alert('上传失败: ' + (data.error || '未知错误'));
            }
        } catch (e) {
            console.warn('Failed to upload avatar to server, using local blob:', e);
        }
    };

    const handleResetAvatar = async () => {
        setAvatarUrl(null);
        await localforage.removeItem('custom-avatar');
        
        try {
            const response = await fetch('/api/reset/avatar', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey
                }
            });
            if (response.status === 401) {
                alert('API 密钥无效，请在设置面板中配置正确的密钥！');
            }
        } catch (e) {
            console.warn('Failed to reset avatar on server:', e);
        }
    };

    const cardBlur = Math.max(0, 16 - bgOverlayBlur);

    if (!isConfigLoaded) {
        return null;
    }

    return (
        <>
            {/* Background Layer */}
            {!mediaUrl && (
                <div className="ambient-background">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>
            )}
            
            {mediaUrl && mediaType === 'image' && (
                <img key={mediaUrl} src={mediaUrl} className="custom-background-layer" alt="bg" />
            )}
            
            {mediaUrl && mediaType === 'video' && (
                <video 
                    key={mediaUrl}
                    src={mediaUrl} 
                    className="custom-background-layer" 
                    autoPlay 
                    loop 
                    muted 
                    defaultMuted
                    playsInline 
                    ref={(el) => {
                        if (el) {
                            el.muted = true;
                            el.play().catch(err => {
                                console.warn("Video autoplay failed, waiting for user interaction:", err);
                            });
                        }
                    }}
                />
            )}

            {mediaUrl && (
                <div 
                    className="media-overlay"
                    style={{
                        backdropFilter: bgOverlayBlur > 0 ? `blur(${bgOverlayBlur}px)` : 'none',
                        WebkitBackdropFilter: bgOverlayBlur > 0 ? `blur(${bgOverlayBlur}px)` : 'none',
                        backgroundColor: enableBgOverlay
                            ? (bgOverlayFollowsTheme && activeScheme
                                ? hexToRgba(hexFromArgb(activeScheme.surfaceVariant), isDark ? 0.6 : 0.5)
                                : (isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)'))
                            : 'transparent'
                    }}
                ></div>
            )}

            <TopBar 
                isDark={isDark} 
                setIsDark={setIsDark} 
                setAdminActive={setAdminActive} 
                setActiveTab={setActiveTab}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                brandTitle={brandTitle}
                setBrandTitle={setBrandTitle}
                brandSubtitle={brandSubtitle}
                setBrandSubtitle={setBrandSubtitle}
                showAdminPill={showAdminPill}
            />

            <div className="main-layout">
                <HeroSection 
                    heroStyle={heroStyle} 
                    socialLinks={socialLinks} 
                    isEditMode={isEditMode}
                    avatarUrl={avatarUrl}
                    onAvatarUpload={handleAvatarUpload}
                    onResetAvatar={handleResetAvatar}
                    onOpenSocialSettings={() => {
                        setActiveTab('social');
                        setAdminActive(true);
                    }}
                    username={username}
                    setUsername={setUsername}
                    personalSign={personalSign}
                    setPersonalSign={setPersonalSign}
                    cardBlur={cardBlur}
                />
                <AppGrid 
                    cards={cards} 
                    setCards={setCards} 
                    isEditMode={isEditMode} 
                    kumaSlug={kumaSlug}
                    cardBlur={cardBlur}
                />
            </div>

            <AdminModal 
                active={adminActive} 
                activeTab={activeTab}
                onClose={() => setAdminActive(false)} 
                themeStyle={themeStyle}
                setThemeStyle={setThemeStyle}
                baseColor={baseColor}
                onColorChange={setBaseColor}
                onMediaUpload={handleMediaUpload}
                onResetMedia={handleResetMedia}
                hasMedia={!!mediaUrl}
                heroStyle={heroStyle}
                setHeroStyle={setHeroStyle}
                socialLinks={socialLinks}
                setSocialLinks={setSocialLinks}
                enableBgOverlay={enableBgOverlay}
                setEnableBgOverlay={setEnableBgOverlay}
                bgOverlayFollowsTheme={bgOverlayFollowsTheme}
                setBgOverlayFollowsTheme={setBgOverlayFollowsTheme}
                bgOverlayBlur={bgOverlayBlur}
                setBgOverlayBlur={setBgOverlayBlur}
                kumaUrl={kumaUrl}
                setKumaUrl={setKumaUrl}
                kumaSlug={kumaSlug}
                setKumaSlug={setKumaSlug}
                setActiveTab={setActiveTab}
            />
        </>
    );
}
