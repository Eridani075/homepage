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

const SortableCard = ({ app, index, isEditMode, onEditClick, appDots, hasRealUptime, cardBlur }) => {
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

    const isOnline = appDots ? appDots[appDots.length - 1] === 'up' : true;
    const uptimePercentage = appDots 
        ? Math.round((appDots.filter(d => d === 'up').length / appDots.length) * 100) 
        : 100;

    return (
        <div 
            ref={setNodeRef} 
            {...attributes} 
            {...listeners}
            className={`sortable-wrapper ${isDragging ? 'dragging' : ''}`}
            style={{ ...style, display: 'flex', height: '100%' }}
        >
            <a
                href={isEditMode ? '#' : (app.url || '#')}
                target={isEditMode ? undefined : '_blank'}
                rel={isEditMode ? undefined : 'noopener noreferrer'}
                className="card"
                onClick={(e) => { if(isEditMode) e.preventDefault(); }}
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    boxSizing: 'border-box',
                    backdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none',
                    WebkitBackdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none'
                }}
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
                            {hasRealUptime ? (
                                <>
                                    <div className="status-indicator">
                                        <span className={`uptime-status-dot ${isOnline ? 'online pulsing' : 'offline'}`}></span>
                                        <span className="status-text">
                                            {isOnline ? '服务运行中' : '服务连接异常'}
                                        </span>
                                    </div>
                                    <span className="uptime-text" style={{ color: isOnline ? 'var(--uptime-green, #10b981)' : 'var(--uptime-red, #ef4444)' }}>
                                        Uptime {uptimePercentage}%
                                    </span>
                                </>
                            ) : (
                                <div className="status-indicator" style={{ opacity: 0.7 }}>
                                    <span className="uptime-status-dot unconfigured"></span>
                                    <span className="status-text" style={{ color: 'var(--text-variant)' }}>
                                        未配置 Uptime 服务
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </a>
        </div>
    );
}

export default function AppGrid({ cards, setCards, isEditMode, kumaSlug, cardBlur }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [kumaData, setKumaData] = useState({});

    React.useEffect(() => {
        let isMounted = true;
        const fetchUptime = async () => {
            try {
                const res = await fetch(`/kuma-api/status-page/${kumaSlug || 'default'}`);
                if (!res.ok) throw new Error('Status page response not OK');
                const data = await res.json();
                
                if (!isMounted) return;

                const newDataMap = {};
                if (data && data.heartbeatList) {
                    for (const [monitorId, heartbeatList] of Object.entries(data.heartbeatList)) {
                        if (heartbeatList && heartbeatList.length > 0) {
                            const statusHistory = heartbeatList.map(beat => beat.status === 1 ? 'up' : 'down');
                            newDataMap[monitorId] = statusHistory;
                        }
                    }
                }
                setKumaData(newDataMap);
            } catch (err) {
                console.warn("Unable to fetch Uptime Kuma data, using mock data:", err);
            }
        };

        fetchUptime();
        const interval = setInterval(fetchUptime, 60000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [kumaSlug]);

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
        const dotsMap = {};
        cards.forEach((card) => {
            const monitorId = card.kumaMonitorId && card.kumaMonitorId.trim() !== '' 
                ? card.kumaMonitorId.trim() 
                : card.id;

            if (kumaData[monitorId]) {
                dotsMap[card.id] = kumaData[monitorId];
            } else {
                // Seed a simple LCG based on the card id
                const seedStr = card.id || '';
                let seed = 0;
                for (let i = 0; i < seedStr.length; i++) {
                    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
                    seed |= 0; // Convert to 32bit integer
                }
                
                // Linear Congruential Generator parameters (Numerical Recipes)
                let r = Math.abs(seed);
                const nextRandom = () => {
                    r = (r * 9301 + 49297) % 233280;
                    return r / 233280;
                };

                dotsMap[card.id] = Array.from({ length: 30 }).map(() => (nextRandom() > 0.15 ? 'up' : 'down'));
            }
        });
        return dotsMap;
    }, [cards, kumaData]);

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
                        {cards.map((app, index) => {
                            const monitorId = app.kumaMonitorId && app.kumaMonitorId.trim() !== '' 
                                ? app.kumaMonitorId.trim() 
                                : app.id;
                            const hasRealUptime = !!kumaData[monitorId];

                            return (
                                <SortableCard
                                    key={app.id}
                                    app={app}
                                    index={index}
                                    isEditMode={isEditMode}
                                    onEditClick={handleEditClick}
                                    appDots={appDots[app.id] || []}
                                    hasRealUptime={hasRealUptime}
                                    cardBlur={cardBlur}
                                />
                            );
                        })}
                    </SortableContext>

                    {isEditMode && (
                        <div 
                            className="card add-card-placeholder" 
                            onClick={handleAddClick}
                            style={{
                                backdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none',
                                WebkitBackdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : 'none'
                            }}
                        >
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
