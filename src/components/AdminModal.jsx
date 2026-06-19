import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import iro from '@jaames/iro';
import CustomSelect from './CustomSelect';
import SocialSettingsTab from './SocialSettingsTab';

export default function AdminModal({ 
    active, 
    activeTab,
    onClose, 
    themeStyle, 
    setThemeStyle, 
    heroStyle,
    setHeroStyle,
    onMediaUpload, 
    onColorChange,
    onResetMedia,
    baseColor,
    socialLinks,
    setSocialLinks,
    enableBgOverlay,
    setEnableBgOverlay,
    bgOverlayFollowsTheme,
    setBgOverlayFollowsTheme,
    bgOverlayBlur,
    setBgOverlayBlur
}) {
    const colorPickerRef = useRef(null);
    const iroColorPicker = useRef(null);

    // Save the latest callback to a ref to avoid recreating the picker on every drag
    const onColorChangeRef = useRef(onColorChange);
    useEffect(() => {
        onColorChangeRef.current = onColorChange;
    }, [onColorChange]);

    useEffect(() => {
        if (!colorPickerRef.current) return;
        
        // Ensure any previous instance DOM is cleared (especially during Vite HMR)
        colorPickerRef.current.innerHTML = '';
        
        iroColorPicker.current = new iro.ColorPicker(colorPickerRef.current, {
            width: 200,
            color: baseColor || "#6200EE",
            margin: 20, // Increased margin for better spacing
            sliderHeight: 16,
            layoutDirection: 'horizontal', // Makes sliders vertical next to the wheel
            layout: [
                { component: iro.ui.Wheel },
                { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
                { component: iro.ui.Slider, options: { sliderType: 'value' } },
            ]
        });

        // Use color:change to capture drag
        iroColorPicker.current.on('color:change', (color) => {
            if (onColorChangeRef.current) {
                onColorChangeRef.current(color.hexString);
            }
        });

        return () => {
            if (colorPickerRef.current) {
                colorPickerRef.current.innerHTML = '';
            }
            iroColorPicker.current = null;
        }
    }, [active, activeTab, baseColor]); // Depend on active and activeTab to re-initialize when visible

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onMediaUpload(file);
            e.target.value = ''; // allow uploading same file again
        }
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'layout':
                return (
                    <div className="form-group">
                        <label>左侧边栏布局</label>
                        <CustomSelect 
                            value={heroStyle} 
                            onChange={setHeroStyle}
                            options={[
                                { value: 'card', label: '大号悬浮卡片式 (推荐)' },
                                { value: 'minimal', label: '极简分割线式' }
                            ]}
                        />
                        <p style={{marginTop: '1rem', color: 'var(--text-variant)', fontSize: '0.9rem'}}>选择“大号悬浮卡片式”在使用自定义图片背景时会提供更好的内容可读性。</p>
                    </div>
                );
            case 'social':
                return (
                    <SocialSettingsTab 
                        socialLinks={socialLinks} 
                        setSocialLinks={setSocialLinks} 
                    />
                );
            case 'palette':
            default:
                return (
                    <>
                        <div className="form-group">
                            <label>十六进制基础取色</label>
                            <div className="color-picker-wrap">
                                <div ref={colorPickerRef} className="iro-color-picker"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>色彩风格提取策略</label>
                            <CustomSelect 
                                value={themeStyle} 
                                onChange={setThemeStyle}
                                options={[
                                    { value: 'TONAL_SPOT', label: 'Tonal Spot (柔和/默认)' },
                                    { value: 'VIBRANT', label: 'Vibrant (鲜艳明亮)' },
                                    { value: 'EXPRESSIVE', label: 'Expressive (表现力/丰富)' },
                                    { value: 'RAINBOW', label: 'Rainbow (彩虹/多色相)' },
                                    { value: 'FRUIT_SALAD', label: 'Fruit Salad (双色撞色)' }
                                ]}
                            />
                        </div>
                        <div className="form-group">
                            <label>背景遮罩控制</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'normal' }}>
                                    <span>开启背景颜色遮罩</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={enableBgOverlay} onChange={(e) => setEnableBgOverlay(e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: enableBgOverlay ? 'pointer' : 'not-allowed', fontSize: '0.9rem', color: 'var(--text-main)', opacity: enableBgOverlay ? 1 : 0.5, fontWeight: 'normal' }}>
                                    <span>遮罩颜色跟随动态主题色</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={bgOverlayFollowsTheme} disabled={!enableBgOverlay} onChange={(e) => setBgOverlayFollowsTheme(e.target.checked)} />
                                        <span className="slider"></span>
                                    </label>
                                </label>
                                <div style={{ opacity: enableBgOverlay ? 1 : 0.5, pointerEvents: enableBgOverlay ? 'auto' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        <span>遮罩模糊程度</span>
                                        <span>{bgOverlayBlur}px</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="64" 
                                        value={bgOverlayBlur} 
                                        onChange={(e) => setBgOverlayBlur(Number(e.target.value))} 
                                        className="m3-slider"
                                        style={{ '--slider-val': `${(bgOverlayBlur / 64) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>从图片/视频提取色彩</label>
                            <div className="file-upload">
                                <span style={{padding: '1rem', position: 'relative', zIndex: 10, pointerEvents: 'none'}}>点击上传自定义背景<br/><small>(支持 jpg, png, mp4)</small></span>
                                <input type="file" onChange={handleFileChange} accept="image/*,video/*" />
                            </div>
                            <button className="btn-secondary" onClick={onResetMedia}>恢复默认光斑背景</button>
                        </div>
                    </>
                );
        }
    };

    const getTitle = () => {
        switch(activeTab) {
            case 'layout': return '界面布局设置';
            case 'social': return '社交媒体设置';
            case 'palette': default: return '色彩与背景设置';
        }
    };

    return (
        <div className={`admin-overlay ${active ? 'active' : ''}`}>
            <div className={`admin-panel-wrapper ${activeTab === 'social' ? 'wide-panel' : ''}`}>
                <div className="admin-panel">
                    <div className="admin-header">
                        <h2>{getTitle()}</h2>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                {renderContent()}

                </div>
            </div>
        </div>
    );
}
