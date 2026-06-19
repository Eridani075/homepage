import React, { useRef, useState } from 'react';
import { Server, Globe, Box, Settings, Database, Wifi, Terminal, HardDrive, Monitor, Activity, Shield, Trash2, Plus } from 'lucide-react';
import AddCardModal from './AddCardModal';

const iconMap = {
    Globe, Server, Box, Settings, Database, Wifi, Terminal, HardDrive, Monitor, Activity, Shield
};

export default function AppGrid({ cards, setCards, isEditMode }) {
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Drag and Drop refs
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [draggingIndex, setDraggingIndex] = useState(null);

    // Save to local storage whenever we update cards
    const updateCards = (newCards) => {
        setCards(newCards);
        localStorage.setItem('dashboard-cards', JSON.stringify(newCards));
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
        setDraggingIndex(index);
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        // Need to set data to allow drag
        e.dataTransfer.setData('text/plain', index);
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const _cards = [...cards];
            const draggedCardContent = _cards[dragItem.current];
            _cards.splice(dragItem.current, 1);
            _cards.splice(dragOverItem.current, 0, draggedCardContent);
            updateCards(_cards);
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setDraggingIndex(null);
    };

    const handleDelete = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('确定要删除这个应用卡片吗？')) {
            const newCards = cards.filter(card => card.id !== id);
            updateCards(newCards);
        }
    };

    const handleAddCard = (newCard) => {
        const newCards = [...cards, newCard];
        updateCards(newCards);
        setShowAddModal(false);
    };

    // Virtual uptime dots data
    const appDots = React.useMemo(() => {
        return cards.map(() => Array.from({length: 60}).map(() => Math.random() > 0.15 ? 'up' : 'down'));
    }, [cards.length]); // Re-compute if length changes, though normally this would be real data

    return (
        <>
            <div className={`grid ${isEditMode ? 'edit-mode' : ''}`}>
                {cards.map((app, index) => {
                    const IconComponent = iconMap[app.iconName] || Box;
                    
                    return (
                        <a 
                            href="#" 
                            className={`card ${draggingIndex === index ? 'dragging' : ''}`} 
                            style={{ animationDelay: isEditMode ? '0ms' : `${100 + index * 80}ms` }} 
                            key={app.id || index}
                            draggable={isEditMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => { if(isEditMode) e.preventDefault(); }}
                        >
                            {isEditMode && (
                                <button className="delete-card-btn" onClick={(e) => handleDelete(e, app.id)}>
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <div className="icon-wrapper">
                                <IconComponent size={32} />
                            </div>
                            <h2 className="card-title">{app.title}</h2>
                            <div className="card-content-wrapper">
                                <p className="card-desc">{app.desc}</p>
                                
                                {app.showUptime && (
                                    <div className="uptime-container">
                                        <div className="uptime-dots">
                                            {appDots[index] && appDots[index].map((status, i) => (
                                                <div key={i} className={`uptime-dot ${status}`}></div>
                                            ))}
                                        </div>
                                        <span className="uptime-text">Up</span>
                                    </div>
                                )}
                            </div>
                        </a>
                    );
                })}

                {isEditMode && (
                    <div className="card add-card-placeholder" onClick={() => setShowAddModal(true)}>
                        <div className="add-icon-wrapper">
                            <Plus size={48} />
                        </div>
                        <h3>添加应用</h3>
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddCardModal 
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddCard}
                />
            )}
        </>
    );
}
