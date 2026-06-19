import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash, Plus } from 'lucide-react';
import { socialIconMap } from '../socialIconMap';

export default function SocialSettingsTab({ socialLinks, setSocialLinks }) {
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newIcon, setNewIcon] = useState('LinkIcon');

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(socialLinks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSocialLinks(items);
    };

    const handleDelete = (id) => {
        setSocialLinks(socialLinks.filter(link => link.id !== id));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newTitle || !newUrl) return;
        const newLink = {
            id: Date.now().toString(),
            icon: newIcon,
            title: newTitle,
            url: newUrl
        };
        setSocialLinks([...socialLinks, newLink]);
        setNewTitle('');
        setNewUrl('');
    };

    return (
        <div className="social-settings-tab">
            <div className="social-settings-column">
                <h3 style={{ marginBottom: '1rem', color: 'var(--on-surface)' }}>当前链接 (拖拽排序)</h3>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="social-links-list">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="social-admin-list">
                                {socialLinks.map((link, index) => {
                                    const IconComp = socialIconMap[link.icon] || socialIconMap['LinkIcon'];
                                    return (
                                        <Draggable key={link.id} draggableId={link.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={provided.draggableProps.style}
                                                    className="social-admin-item"
                                                >
                                                    <div className="item-left">
                                                        <div className="item-icon"><IconComp size={20} /></div>
                                                        <div className="item-details">
                                                            <span className="item-title">{link.title}</span>
                                                            <span className="item-url">{link.url}</span>
                                                        </div>
                                                    </div>
                                                    <button className="btn-icon delete-btn" onClick={() => handleDelete(link.id)} title="删除">
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <div className="social-settings-column">
                <h3 style={{ marginBottom: '1rem', color: 'var(--on-surface)' }}>添加新链接</h3>
                <form className="add-social-form" onSubmit={handleAdd}>
                <div className="form-group">
                    <label>选择图标</label>
                    <div className="icon-grid" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {Object.keys(socialIconMap).map(iconName => {
                            const IconComponent = socialIconMap[iconName];
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    className={`icon-option ${newIcon === iconName ? 'selected' : ''}`}
                                    onClick={() => setNewIcon(iconName)}
                                    title={iconName}
                                >
                                    <IconComponent size={24} />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="form-group">
                    <label>提示文本 (Title)</label>
                    <input 
                        type="text" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)} 
                        placeholder="例如：我的 GitHub"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>目标链接 (URL)</label>
                    <input 
                        type="text" 
                        value={newUrl} 
                        onChange={(e) => setNewUrl(e.target.value)} 
                        placeholder="例如：https://github.com/..."
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> 添加链接
                </button>
                </form>
            </div>
        </div>
    );
}
