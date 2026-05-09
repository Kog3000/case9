// src/Header/Notifications.jsx
import { useState, useEffect, useRef } from 'react';
import bellIcon from '../assets/bellp_icon.svg';
import './Notifications.css';
import NotificationModal from './NotificationModal';

export default function Notifications({ notifications: initialNotifications = [] }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsList, setNotificationsList] = useState(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showProblemModal, setShowProblemModal] = useState(false);
    const notificationRef = useRef(null);

    // Подсчет непрочитанных уведомлений
    useEffect(() => {
        const unread = notificationsList.filter(n => !n.read).length;
        setUnreadCount(unread);
    }, [notificationsList]);

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNoticeClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleNotificationClick = (notification) => {
        // Отмечаем как прочитанное
        setNotificationsList(prev => 
            prev.map(notif => 
                notif.id === notification.id ? { ...notif, read: true } : notif
            )
        );
        
        // Открываем модальное окно с проблемой
        setSelectedNotification(notification);
        setShowProblemModal(true);
        setShowNotifications(false);
    };

    const handleMarkAllRead = () => {
        setNotificationsList(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const handleClearAll = () => {
        setNotificationsList([]);
        setShowNotifications(false);
    };

    const handleCloseProblemModal = () => {
        setShowProblemModal(false);
        setSelectedNotification(null);
    };

    const handleProblemSolved = (notificationId, solution) => {
        setNotificationsList(prev => 
            prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, solved: true, solution: solution, status: 'resolved' } 
                    : notif
            )
        );
        handleCloseProblemModal();
    };

    return (
        <>
            <div className='bellIcon' style={{ position: 'relative', cursor: 'pointer' }} ref={notificationRef}>
                <img onClick={handleNoticeClick} className='bellImage' src={bellIcon} alt='bell' />
                {unreadCount > 0 && (
                    <span className='notification-badge'>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                
                {showNotifications && (
                    <div className="notifications-modal">
                        <div className="notifications-header">
                            <h3>Уведомления</h3>
                            <div className="notifications-actions">
                                {notificationsList.length > 0 && (
                                    <button 
                                        className="mark-all-read-btn" 
                                        onClick={handleMarkAllRead}
                                    >
                                        Все прочитано
                                    </button>
                                )}
                                <button 
                                    className="close-modal-btn" 
                                    onClick={() => setShowNotifications(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="notifications-list">
                            {notificationsList.length === 0 ? (
                                <div className="no-notifications">
                                    
                                    <div className="no-notifications-text">Нет уведомлений</div>
                                </div>
                            ) : (
                                notificationsList.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.solved ? 'solved' : ''}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="notification-dot"></div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-time">{notif.time}</div>
                                            {notif.priority && (
                                                <div className={`notification-priority priority-${notif.priority}`}>
                                                    {notif.priority === 'high' && 'Высокий приоритет'}
                                                    {notif.priority === 'medium' && 'Средний приоритет'}
                                                    {notif.priority === 'low' && 'Низкий приоритет'}
                                                </div>
                                            )}
                                            {notif.solved && (
                                                <div className="notification-solved-badge">Решено</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {notificationsList.length > 0 && (
                            <div className="notifications-footer">
                                <button className="clear-all-btn" onClick={handleClearAll}>
                                    Очистить все
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showProblemModal && selectedNotification && (
                <NotificationModal
                    notification={selectedNotification}
                    onClose={handleCloseProblemModal}
                    onSolved={handleProblemSolved}
                />
            )}
        </>
    );
}