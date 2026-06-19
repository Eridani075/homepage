import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Palette, Sparkles, LayoutTemplate, Edit2, X, Compass } from 'lucide-react';

export default function TopBar({ isDark, setIsDark, setAdminActive, setActiveTab, isEditMode, setIsEditMode, brandSubtitle, setBrandSubtitle }) {
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

    const enterEditMode = () => {
        setIsEditMode(true);
        setSettingsExpanded(false);
    };

    const handleTriggerClick = () => {
        if (isEditMode) {
            setIsEditMode(false);
        } else {
            setSettingsExpanded(!settingsExpanded);
        }
    };
    return (
        <nav className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
            <div className="top-bar-container">
                <div className="brand">
                    <h1>控制台</h1>
                    <div className="brand-divider"></div>
                    {isEditMode ? (
                        <input 
                            type="text" 
                            className="brand-subtitle-input" 
                            value={brandSubtitle} 
                            onChange={(e) => setBrandSubtitle(e.target.value)} 
                            placeholder="家庭数据中心"
                        />
                    ) : (
                        <span className="brand-subtitle">{brandSubtitle}</span>
                    )}
                </div>
                <div className="controls">
                    <button className="btn-icon small-btn theme-toggle-btn" onClick={() => setIsDark(!isDark)} title="切换模式">
                        <div className={`icon-wrapper ${isDark ? 'is-dark' : 'is-light'}`}>
                            <Sun size={20} className="sun-icon" />
                            <Moon size={20} className="moon-icon" />
                        </div>
                    </button>
                    
                    <div className={`settings-pill ${settingsExpanded && !isEditMode ? 'expanded' : ''}`}>
                        <div className="settings-pill-content desktop-only">
                            <button className="pill-btn" onClick={enterEditMode} title="编辑应用卡片">
                                <Edit2 size={18} />
                            </button>
                            <button className="pill-btn" onClick={() => openSettings('palette')} title="色彩与背景">
                                <Palette size={18} />
                            </button>

                            <button className="pill-btn" onClick={() => openSettings('layout')} title="界面布局">
                                <LayoutTemplate size={18} />
                            </button>
                        </div>
                        <button className="btn-icon small-btn trigger-btn" onClick={handleTriggerClick} title={isEditMode ? "退出编辑" : "系统设置"}>
                            {isEditMode ? <X size={20} /> : <Settings size={20} className={settingsExpanded ? 'rotate-icon' : ''} />}
                        </button>
                    </div>
                    
                    {/* Mobile Dropdown Menu */}
                    <div className={`mobile-dropdown-menu ${settingsExpanded && !isEditMode ? 'open' : ''}`}>
                        <button className="dropdown-item" onClick={enterEditMode}>
                            <Edit2 size={16} /> 编辑卡片
                        </button>
                        <button className="dropdown-item" onClick={() => openSettings('palette')}>
                            <Palette size={16} /> 色彩与背景
                        </button>
                        <button className="dropdown-item" onClick={() => openSettings('layout')}>
                            <LayoutTemplate size={16} /> 界面布局
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}
