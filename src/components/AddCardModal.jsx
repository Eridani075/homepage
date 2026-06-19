import React, { useState } from 'react';
import { X } from 'lucide-react';
import { iconMap } from '../iconMap';

export default function AddCardModal({ onClose, onAdd }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Globe');
    const [showUptime, setShowUptime] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        onAdd({
            id: Date.now().toString(),
            title: title.trim(),
            desc: desc.trim(),
            iconName: selectedIcon,
            showUptime
        });
    };

    return (
        <div className="admin-overlay active">
            <div className="admin-panel" style={{ maxWidth: '500px' }}>
                <div className="admin-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>添加新应用卡片</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="admin-content" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} className="add-card-form">
                        <div className="form-group">
                            <label style={{ fontSize: '1.1rem' }}>应用标题</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                placeholder="例如：Plex 媒体服务器" 
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label style={{ fontSize: '1.1rem' }}>应用描述</label>
                            <textarea 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                placeholder="简单介绍这个应用的作用..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '1.1rem' }}>选择图标</label>
                            <div className="icon-grid" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                                {Object.keys(iconMap).map(iconName => {
                                    const IconComponent = iconMap[iconName];
                                    return (
                                        <div 
                                            key={iconName}
                                            className={`icon-option ${selectedIcon === iconName ? 'selected' : ''}`}
                                            onClick={() => setSelectedIcon(iconName)}
                                            title={iconName}
                                        >
                                            <IconComponent size={24} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group row-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <label style={{ margin: 0, fontSize: '1.1rem' }}>启用 Uptime 监控悬浮动效</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={showUptime} 
                                    onChange={(e) => setShowUptime(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <button type="submit" className="save-btn beautiful-btn" style={{marginTop: '2.5rem'}}>
                            添加至控制台
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
