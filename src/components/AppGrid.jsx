import React, { useState } from 'react';
import { Edit2, Plus, Box } from 'lucide-react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { 
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { iconMap } from '../iconMap';
import CardFormModal from './CardFormModal';

const UptimeDots = React.memo(({ dots }) => {
    if (!dots) return null;
    return (
        <div className="uptime-dots">
            {dots.map((status, i) => (
                <div key={i} className={`uptime-dot ${status}`}></div>
            ))}
        </div>
    );
});

const SortableCard = ({ app, index, isEditMode, onEditClick, appDots }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: app.id, disabled: !isEditMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.8 : 1,
    };
    const IconComponent = iconMap[app.iconName] || Box;

    return (
        <a
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            href="#"
            className={`card ${isDragging ? 'dragging' : ''}`}
            onClick={(e) => { if(isEditMode) e.preventDefault(); }}
        >
            {isEditMode && (
                <button 
                    className="edit-card-btn" 
                    onClick={(e) => onEditClick(e, app)} 
                    onPointerDown={(e) => e.stopPropagation()}
                    title="编辑卡片"
                >
                    <Edit2 size={18} />
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
                        <UptimeDots dots={appDots} />
                        <span className="uptime-text">100%</span>
                    </div>
                )}
            </div>
        </a>
    );
}

export default function AppGrid({ cards, setCards, isEditMode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const updateCards = (newCards) => {
        setCards(newCards);
        localStorage.setItem('dashboard-cards', JSON.stringify(newCards));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = cards.findIndex((card) => card.id === active.id);
            const newIndex = cards.findIndex((card) => card.id === over.id);

            updateCards(arrayMove(cards, oldIndex, newIndex));
        }
    };

    const handleEditClick = (e, card) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingCard(null);
        setIsModalOpen(true);
    };

    const handleSaveCard = (savedCard) => {
        if (editingCard) {
            const newCards = cards.map(c => c.id === savedCard.id ? savedCard : c);
            updateCards(newCards);
        } else {
            const newCards = [...cards, savedCard];
            updateCards(newCards);
        }
        setIsModalOpen(false);
        setEditingCard(null);
    };

    const handleDeleteCard = (id) => {
        const newCards = cards.filter(card => card.id !== id);
        updateCards(newCards);
        setIsModalOpen(false);
        setEditingCard(null);
    };

    const appDots = React.useMemo(() => {
        return cards.map(() => Array.from({length: 60}).map(() => Math.random() > 0.15 ? 'up' : 'down'));
    }, [cards.length]);

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                <div className={`grid ${isEditMode ? 'edit-mode' : ''}`}>
                    <SortableContext
                        items={cards.map(c => c.id)}
                        strategy={rectSortingStrategy}
                    >
                        {cards.map((app, index) => (
                            <SortableCard
                                key={app.id}
                                app={app}
                                index={index}
                                isEditMode={isEditMode}
                                onEditClick={handleEditClick}
                                appDots={appDots[index]}
                            />
                        ))}
                    </SortableContext>

                    {isEditMode && (
                        <div className="card add-card-placeholder" onClick={handleAddClick}>
                            <div className="add-icon-wrapper">
                                <Plus size={48} />
                            </div>
                            <h3>添加应用</h3>
                        </div>
                    )}
                </div>
            </DndContext>

            {isModalOpen && (
                <CardFormModal
                    initialData={editingCard}
                    onClose={() => { setIsModalOpen(false); setEditingCard(null); }}
                    onSave={handleSaveCard}
                    onDelete={handleDeleteCard}
                />
            )}
        </>
    );
}
