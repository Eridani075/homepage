import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import iro from '@jaames/iro';

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
    baseColor
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
    }, []); // Empty dependency array prevents recreation on color change

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onMediaUpload(file);
            e.target.value = ''; // allow uploading same file again
        }
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'style':
                return (
                    <div className="form-group">
                        <label>Material 3 取色风格</label>
                        <select 
                            className="style-select" 
                            value={themeStyle} 
                            onChange={(e) => setThemeStyle(e.target.value)}
                        >
                            <option value="TONAL_SPOT">Tonal Spot (柔和/默认)</option>
                            <option value="VIBRANT">Vibrant (鲜艳活力)</option>
                            <option value="EXPRESSIVE">Expressive (极具表现力)</option>
                            <option value="RAINBOW">Rainbow (彩虹)</option>
                            <option value="FRUIT_SALAD">Fruit Salad (高对比度)</option>
                        </select>
                        <p style={{marginTop: '1rem', color: 'var(--text-variant)', fontSize: '0.9rem'}}>切换不同的色彩引擎，算法会基于你的主色调或者壁纸生成不同风格的全局配色方案。</p>
                    </div>
                );
            case 'layout':
                return (
                    <div className="form-group">
                        <label>左侧边栏布局</label>
                        <select 
                            className="style-select" 
                            value={heroStyle} 
                            onChange={(e) => setHeroStyle(e.target.value)}
                        >
                            <option value="card">大号悬浮卡片式 (推荐)</option>
                            <option value="minimal">极简分割线式</option>
                        </select>
                        <p style={{marginTop: '1rem', color: 'var(--text-variant)', fontSize: '0.9rem'}}>选择“大号悬浮卡片式”在使用自定义图片背景时会提供更好的内容可读性。</p>
                    </div>
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

                        <div className="form-group" style={{ textAlign: 'center', color: 'var(--text-variant)', margin: '0.5rem 0' }}>
                            — 或 —
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
            case 'style': return '色彩引擎风格';
            case 'layout': return '界面布局设置';
            case 'palette': default: return '色彩与背景设置';
        }
    };

    return (
        <div className={`admin-overlay ${active ? 'active' : ''}`}>
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
    );
}
