import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Palette, Sparkles, LayoutTemplate } from 'lucide-react';

export default function TopBar({ isDark, setIsDark, setAdminActive, setActiveTab }) {
    const [scrolled, setScrolled] = useState(false);
    const [settingsExpanded, setSettingsExpanded] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openSettings = (tab) => {
        setActiveTab(tab);
        setAdminActive(true);
        setSettingsExpanded(false);
    };
    return (
        <nav className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
            <div className="top-bar-container">
                <div className="brand">
                    <h1>控制台</h1>
                    <div className="brand-divider"></div>
                    <span className="brand-subtitle">家庭数据中心</span>
                </div>
                <div className="controls">
                    <button className="btn-icon small-btn theme-toggle-btn" onClick={() => setIsDark(!isDark)} title="切换模式">
                        <div className={`icon-wrapper ${isDark ? 'is-dark' : 'is-light'}`}>
                            <Sun size={20} className="sun-icon" />
                            <Moon size={20} className="moon-icon" />
                        </div>
                    </button>
                    
                    <div className={`settings-pill ${settingsExpanded ? 'expanded' : ''}`}>
                        <div className="settings-pill-content">
                            <button className="pill-btn" onClick={() => openSettings('palette')} title="色彩与背景">
                                <Palette size={18} />
                            </button>
                            <button className="pill-btn" onClick={() => openSettings('style')} title="色彩引擎风格">
                                <Sparkles size={18} />
                            </button>
                            <button className="pill-btn" onClick={() => openSettings('layout')} title="界面布局">
                                <LayoutTemplate size={18} />
                            </button>
                        </div>
                        <button className="btn-icon small-btn trigger-btn" onClick={() => setSettingsExpanded(!settingsExpanded)} title="系统设置">
                            <Settings size={20} className={settingsExpanded ? 'rotate-icon' : ''} />
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}
