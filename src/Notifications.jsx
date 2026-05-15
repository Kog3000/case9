// src/Header/Notifications.jsx
import { useState, useEffect, useRef } from 'react';
import bellIcon from '../assets/bellp_icon.svg';
import './Notifications.css';
import NotificationModal from './NotificationModal';
import {
    fetchSupervisorNotifications,
    fetchOperatorCompletedNotifications,
    changeNotificationStatus
} from './Api/notificationService';


export default function Notifications({ notifications: initialNotifications = [], userRole }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsList, setNotificationsList] = useState(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showProblemModal, setShowProblemModal] = useState(false);
    const notificationRef = useRef(null);

    const problemTypesTitleMap = {
    technical: 'Техническая проблема',
    order: 'Проблема с заказом',
    client: 'Конфликт с клиентом',
    equipment: 'Неисправность оборудования',
    other: 'Другая проблема'
};

const typeProblemMap = {
    1: 'technical',
    2: 'order', 
    3: 'client',
    4: 'equipment',
    5: 'other'
};

const priorityMap = {
    1: 'high',
    2: 'medium',
    3: 'low'
};

    const normalizeNotification = (notification) => {
        const problemType =
            typeProblemMap[notification.type_problem] ||
            notification.problemType ||
            notification.problem_type ||
            notification.type ||
            'other';

        const priority =
            priorityMap[notification.priority] ||
            notification.priority ||
            'medium';

        const isSolved =
            notification.solved ||
            notification.status === 'completed';

        return {
            ...notification,
            id: notification.id,
            title:
                notification.title ||
                problemTypesTitleMap[problemType] ||
                'Уведомление',
            problemType,
            priority,
            description:
                notification.description ||
                notification.text ||
                notification.message ||
                '',
            time:
                notification.time ||
                notification.timestamp ||
                notification.created_at ||
                '',
            operatorName:
                notification.operatorName ||
                notification.operator_name ||
                notification.operator?.name ||
                '',
            read: notification.read ?? false,
            solved: isSolved,
            status: isSolved ? 'completed' : notification.status,
            problem_solution:
                notification.problem_solution ||
                notification.solution?.text ||
                '',
            solution_date:
                notification.solution_date ||
                notification.solution?.timestamp ||
                ''
        };
    };
    const loadNotifications = async () => {
        try {
            let data = [];

            if (userRole === 'supervisor') {
                data = await fetchSupervisorNotifications();
            } else if (userRole === 'operator') {
                data = await fetchOperatorCompletedNotifications();
            }

            setNotificationsList(data.map(normalizeNotification));
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [userRole]);

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
        setSelectedNotification({ ...notification, read: true });
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

    const handleProblemSolved = async (notificationId, solution) => {
        if (userRole !== 'supervisor') {
            return;
        }

        try {
            const updatedNotification = await changeNotificationStatus(
                notificationId,
                solution.text
            );

            setNotificationsList(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? normalizeNotification({
                            ...notif,
                            ...updatedNotification,
                            read: true,
                            solved: true,
                            status: 'completed',
                            problem_solution:
                                updatedNotification.problem_solution ||
                                solution.text,
                            solution_date:
                                updatedNotification.solution_date ||
                                new Date().toISOString().split('T')[0],
                            solution
                        })
                        : notif
                )
            );

            handleCloseProblemModal();
        } catch (error) {
            console.error('Ошибка изменения статуса уведомления:', error);
            alert(error.message || 'Не удалось изменить статус уведомления');
        }
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