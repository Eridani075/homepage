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

export default function App() {
    const [isDark, setIsDark] = useState(false);
    const [adminActive, setAdminActive] = useState(false);
    const [activeTab, setActiveTab] = useState('palette'); // 'palette', 'style', 'layout'
    const [themeStyle, setThemeStyle] = useState('TONAL_SPOT');
    const [baseColor, setBaseColor] = useState('#6200EE');
    const [mediaUrl, setMediaUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [heroStyle, setHeroStyle] = useState('card'); // 'card' or 'minimal'
    const [isEditMode, setIsEditMode] = useState(false);
    
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

        const savedCards = localStorage.getItem('dashboard-cards');
        if (savedCards) {
            try {
                setCards(JSON.parse(savedCards));
            } catch(e) {}
        }

        localforage.getItem('custom-media').then((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                setMediaUrl(url);
                setMediaType(blob.type.startsWith('video') ? 'video' : 'image');
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
    }, [baseColor, themeStyle, heroStyle]);

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
    };

    const extractColorFromImage = async (url) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        await new Promise(r => img.onload = r);
        const theme = await themeFromImage(img);
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
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const img = new Image();
            img.src = canvas.toDataURL();
            img.onload = async () => {
                const theme = await themeFromImage(img);
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

            {mediaUrl && (
                <div className="media-overlay"></div>
            )}

            <TopBar 
                isDark={isDark} 
                setIsDark={setIsDark} 
                setAdminActive={setAdminActive} 
                setActiveTab={setActiveTab}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
            />

            <div className="main-layout">
                <HeroSection heroStyle={heroStyle} />
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
                heroStyle={heroStyle}
                setHeroStyle={setHeroStyle}
                onColorChange={(hex) => setBaseColor(hex)}
                onMediaUpload={handleMediaUpload}
                onResetMedia={handleResetMedia}
            />
        </>
    );
}
