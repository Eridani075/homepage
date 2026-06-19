import React, { useState } from 'react';
import { Server, Globe, Box, Settings, Database, Wifi, Terminal, HardDrive, Monitor, Activity, Shield, X } from 'lucide-react';

const iconOptions = [
    { name: 'Globe', component: Globe },
    { name: 'Server', component: Server },
    { name: 'Box', component: Box },
    { name: 'Settings', component: Settings },
    { name: 'Database', component: Database },
    { name: 'Wifi', component: Wifi },
    { name: 'Terminal', component: Terminal },
    { name: 'HardDrive', component: HardDrive },
    { name: 'Monitor', component: Monitor },
    { name: 'Activity', component: Activity },
    { name: 'Shield', component: Shield },
];

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
        <div className="admin-modal-overlay active">
            <div className="admin-modal" style={{ maxWidth: '500px' }}>
                <div className="admin-modal-header">
                    <h2>添加新应用卡片</h2>
                    <button className="btn-icon" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="admin-modal-content">
                    <form onSubmit={handleSubmit} className="add-card-form">
                        <div className="form-group">
                            <label>应用标题</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                placeholder="例如：Plex 媒体服务器" 
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>应用描述</label>
                            <textarea 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                placeholder="简单介绍这个应用的作用..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>选择图标</label>
                            <div className="icon-grid">
                                {iconOptions.map(option => {
                                    const IconComponent = option.component;
                                    return (
                                        <div 
                                            key={option.name}
                                            className={`icon-option ${selectedIcon === option.name ? 'selected' : ''}`}
                                            onClick={() => setSelectedIcon(option.name)}
                                        >
                                            <IconComponent size={24} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group row-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <label style={{margin: 0}}>启用 Uptime 监控悬浮动效</label>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={showUptime} 
                                    onChange={(e) => setShowUptime(e.target.checked)} 
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <button type="submit" className="save-btn" style={{marginTop: '2rem'}}>
                            添加卡片
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
