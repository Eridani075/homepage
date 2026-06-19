import React, { useState, useEffect, useRef } from 'react';
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

export default function App() {
    const [isDark, setIsDark] = useState(false);
    const [adminActive, setAdminActive] = useState(false);
    const [activeTab, setActiveTab] = useState('layout'); // 'palette', 'style', 'layout'
    const [socialLinks, setSocialLinks] = useState([
        { id: '1', icon: 'FaGithub', title: 'GitHub', url: 'https://github.com' },
        { id: '2', icon: 'FaXTwitter', title: 'X (Twitter)', url: 'https://twitter.com' },
        { id: '3', icon: 'FaYoutube', title: 'YouTube', url: 'https://youtube.com' },
        { id: '4', icon: 'Mail', title: 'Contact Me', url: 'mailto:hello@example.com' }
    ]);
    const [themeStyle, setThemeStyle] = useState('TONAL_SPOT');
    const [baseColor, setBaseColor] = useState('#6200EE');
    const [mediaUrl, setMediaUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [heroStyle, setHeroStyle] = useState('card'); // 'card' or 'minimal'
    const [isEditMode, setIsEditMode] = useState(false);
    const [avatarText, setAvatarText] = useState('E');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [brandSubtitle, setBrandSubtitle] = useState('家庭数据中心');
    
    // Background Overlay Settings
    const [enableBgOverlay, setEnableBgOverlay] = useState(true);
    const [bgOverlayFollowsTheme, setBgOverlayFollowsTheme] = useState(false);
    const [bgOverlayBlur, setBgOverlayBlur] = useState(8);
    const [activeScheme, setActiveScheme] = useState(null);
    
    const defaultCards = [
        { id: '1', title: '个人博客', desc: '数字花园、笔记、技术教程与开发日志库。', iconName: 'Globe', showUptime: true },
        { id: '2', title: '路由器控制台', desc: 'OpenWrt 智能家庭网关与网络流量管控面板。', iconName: 'Server', showUptime: true },
        { id: '3', title: 'FRP 内网穿透', desc: '外部公网访问本地开发环境与服务的隧道管理。', iconName: 'Box', showUptime: true },
        { id: '4', title: '监控中心 (Grafana)', desc: '探针看板、Docker 容器监控及服务器性能数据。', iconName: 'Settings', showUptime: true },
        { id: '5', title: '私人云盘', desc: 'Nextcloud 数据中心、跨设备文件同步与照片备份。', iconName: 'Database', showUptime: true },
    ];
    const [cards, setCards] = useState(defaultCards);

    // Load initial state
    useEffect(() => {
        const savedMode = localStorage.getItem('theme-mode') || 'light';
        setIsDark(savedMode === 'dark');

        const savedStyle = localStorage.getItem('theme-style') || 'TONAL_SPOT';
        setThemeStyle(savedStyle);

        const savedColor = localStorage.getItem('theme-color');
        if (savedColor) setBaseColor(savedColor);

        const savedHeroStyle = localStorage.getItem('hero-style');
        if (savedHeroStyle) setHeroStyle(savedHeroStyle);

        const savedAvatar = localStorage.getItem('dashboard-avatar');
        if (savedAvatar) setAvatarText(savedAvatar);

        const savedSubtitle = localStorage.getItem('dashboard-subtitle');
        if (savedSubtitle) setBrandSubtitle(savedSubtitle);

        const savedEnableOverlay = localStorage.getItem('bg-overlay-enable');
        if (savedEnableOverlay !== null) setEnableBgOverlay(savedEnableOverlay === 'true');

        const savedOverlayTheme = localStorage.getItem('bg-overlay-follows-theme');
        if (savedOverlayTheme !== null) setBgOverlayFollowsTheme(savedOverlayTheme === 'true');

        const savedOverlayBlur = localStorage.getItem('bg-overlay-blur');
        if (savedOverlayBlur !== null) setBgOverlayBlur(Number(savedOverlayBlur));

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

        localforage.getItem('custom-media').then((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                setMediaUrl(url);
                setMediaType(blob.type.startsWith('video') ? 'video' : 'image');
            }
        });

        localforage.getItem('custom-avatar').then((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                setAvatarUrl(url);
            }
        });
    }, []);

    // Update Theme Class
    useEffect(() => {
        const root = document.documentElement;
        
        // Disable transitions temporarily to prevent backdrop-filter lag during massive variable changes
        document.body.classList.add('theme-switching');
        
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
        applyMaterialTheme(baseColor, isDark, themeStyle);

        // Re-enable transitions after the browser has painted the new colors
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 50);
    }, [isDark]);

    // Reapply theme when color or style changes
    useEffect(() => {
        applyMaterialTheme(baseColor, isDark, themeStyle);
        localStorage.setItem('theme-color', baseColor);
        localStorage.setItem('theme-style', themeStyle);
        localStorage.setItem('hero-style', heroStyle);
        localStorage.setItem('dashboard-social-links', JSON.stringify(socialLinks));
    }, [baseColor, themeStyle, heroStyle, socialLinks]);

    useEffect(() => {
        localStorage.setItem('dashboard-avatar', avatarText);
    }, [avatarText]);

    useEffect(() => {
        localStorage.setItem('dashboard-subtitle', brandSubtitle);
    }, [brandSubtitle]);

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
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        await new Promise(r => img.onload = r);
        
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
        smallImg.src = canvas.toDataURL();
        await new Promise(r => smallImg.onload = r);

        const theme = await themeFromImage(smallImg);
        const extractedHex = hexFromArgb(theme.source);
        setBaseColor(extractedHex);
    };

    const extractColorFromVideo = (url) => {
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
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
            smallImg.src = canvas.toDataURL();
            smallImg.onload = async () => {
                const theme = await themeFromImage(smallImg);
                const extractedHex = hexFromArgb(theme.source);
                setBaseColor(extractedHex);
            };
            video.pause();
        });
    };

    const handleMediaUpload = async (file) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setMediaUrl(url);
        
        const isVideo = file.type.startsWith('video');
        setMediaType(isVideo ? 'video' : 'image');

        await localforage.setItem('custom-media', file);

        if (isVideo) {
            extractColorFromVideo(url);
        } else {
            extractColorFromImage(url);
        }
    };

    const handleResetMedia = async () => {
        setMediaUrl(null);
        setMediaType(null);
        await localforage.removeItem('custom-media');
    };

    const handleAvatarUpload = async (file) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        await localforage.setItem('custom-avatar', file);
    };

    const handleResetAvatar = async () => {
        setAvatarUrl(null);
        await localforage.removeItem('custom-avatar');
    };

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
                <img src={mediaUrl} className="custom-background-layer" alt="bg" />
            )}
            
            {mediaUrl && mediaType === 'video' && (
                <video src={mediaUrl} className="custom-background-layer" autoPlay loop muted playsInline />
            )}

            {mediaUrl && enableBgOverlay && (
                <div 
                    className="media-overlay"
                    style={{
                        backdropFilter: `blur(${bgOverlayBlur}px)`,
                        WebkitBackdropFilter: `blur(${bgOverlayBlur}px)`,
                        backgroundColor: bgOverlayFollowsTheme && activeScheme
                            ? hexToRgba(hexFromArgb(activeScheme.surfaceVariant), isDark ? 0.6 : 0.5)
                            : (isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)')
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
                brandSubtitle={brandSubtitle}
                setBrandSubtitle={setBrandSubtitle}
            />

            <div className="main-layout">
                <HeroSection 
                    heroStyle={heroStyle} 
                    socialLinks={socialLinks} 
                    isEditMode={isEditMode}
                    avatarText={avatarText}
                    setAvatarText={setAvatarText}
                    avatarUrl={avatarUrl}
                    onAvatarUpload={handleAvatarUpload}
                    onResetAvatar={handleResetAvatar}
                    onOpenSocialSettings={() => {
                        setActiveTab('social');
                        setAdminActive(true);
                    }}
                />
                <AppGrid 
                    cards={cards} 
                    setCards={setCards} 
                    isEditMode={isEditMode} 
                />
            </div>

            <AdminModal 
                active={adminActive} 
                activeTab={activeTab}
                onClose={() => setAdminActive(false)} 
                themeStyle={themeStyle}
                setThemeStyle={setThemeStyle}
                baseColor={baseColor}
                setBaseColor={setBaseColor}
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
            />
        </>
    );
}
