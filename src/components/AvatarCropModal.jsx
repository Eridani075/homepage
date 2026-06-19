import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { getCroppedImg } from '../utils/cropImage';

export default function AvatarCropModal({ imageSrc, onCropComplete, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                0
            );
            onCropComplete(croppedImageBlob);
        } catch (e) {
            console.error(e);
        }
    };

    if (!imageSrc) return null;

    return (
        <div className="avatar-crop-overlay">
            <div className="admin-panel-wrapper avatar-crop-panel">
                <div className="admin-panel">
                    <div className="admin-header">
                        <h2>裁剪头像</h2>
                        <button className="close-btn" onClick={onCancel} title="取消">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="crop-container" style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '12px', overflow: 'hidden' }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropCompleteCallback}
                            onZoomChange={setZoom}
                        />
                    </div>
                    
                    <div className="crop-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <ZoomOut size={20} color="var(--text-variant)" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="m3-slider"
                            style={{ flex: 1, '--slider-val': `${((zoom - 1) / 2) * 100}%` }}
                        />
                        <ZoomIn size={20} color="var(--text-variant)" />
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>取消</button>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>确认裁切</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
