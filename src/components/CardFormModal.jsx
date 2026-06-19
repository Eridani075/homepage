import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { iconMap } from '../iconMap';

export default function CardFormModal({ onClose, onSave, onDelete, initialData }) {
    const isEditMode = !!initialData;
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [url, setUrl] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Globe');
    const [showUptime, setShowUptime] = useState(true);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDesc(initialData.desc || '');
            setUrl(initialData.url || '');
            setSelectedIcon(initialData.iconName || 'Globe');
            setShowUptime(initialData.showUptime !== false);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        onSave({
            id: isEditMode ? initialData.id : Date.now().toString(),
            title: title.trim(),
            desc: desc.trim(),
            url: url.trim(),
            iconName: selectedIcon,
            showUptime
        });
    };

    const handleDelete = () => {
        if (confirm('确定要删除这个应用卡片吗？此操作无法恢复。')) {
            onDelete(initialData.id);
        }
    };

    return (
        <div className="admin-overlay active">
            <div className="admin-panel-wrapper">
                <div className="admin-panel">
                    <div className="admin-header">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {isEditMode ? '编辑应用卡片' : '添加新应用卡片'}
                        </h2>
                        <button type="button" className="close-btn" onClick={onClose}><X size={24} /></button>
                    </div>
                    
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
                            <label style={{ fontSize: '1.1rem' }}>跳转链接</label>
                            <input 
                                type="url" 
                                value={url} 
                                onChange={e => setUrl(e.target.value)} 
                                placeholder="https://..." 
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

                        <div className="form-group row-flex setting-card">
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

                        <button type="submit" className="save-btn beautiful-btn" style={{width: '100%'}}>
                            {isEditMode ? '保存修改' : '添加至控制台'}
                        </button>
                        
                        {isEditMode && (
                            <button type="button" className="btn-secondary" style={{width: '100%', color: '#ff5252', borderColor: '#ff5252', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} onClick={handleDelete}>
                                <Trash2 size={18} /> 删除此卡片
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
