import './Header.css'
import { defaultData, notifications } from '../data.js'
import { useState, useEffect, useRef } from 'react'
import bellIcon from '../../assets/bell_icon.svg'
import ProfilePage from '../ProfilePage/ProfilePage'

export default function Header({ onPageChange, currentPage, userName, userData, onLogout }) {
    const [now, setNow] = useState(new Date())
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [notificationsList, setNotificationsList] = useState(notifications)
    const notificationRef = useRef(null)
    const profileModalRef = useRef(null)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Подсчет непрочитанных уведомлений
    useEffect(() => {
        const unread = notificationsList.filter(n => !n.read).length
        setUnreadCount(unread)
    }, [notificationsList])

    // Закрытие модального окна уведомлений при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Закрытие модального окна профиля при клике вне его
    useEffect(() => {
        const handleClickOutsideProfile = (event) => {
            if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
                setShowProfileModal(false)
            }
        }
        
        if (showProfileModal) {
            document.addEventListener('mousedown', handleClickOutsideProfile)
            return () => document.removeEventListener('mousedown', handleClickOutsideProfile)
        }
    }, [showProfileModal])

    // Блокировка скролла body при открытом модальном окне
    useEffect(() => {
        if (showProfileModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showProfileModal])

    const handleProfileClick = () => {
        setShowProfileModal(true)
    }

    const handleCloseProfileModal = () => {
        setShowProfileModal(false)
    }

    const handleLogoClick = () => {
        if (onPageChange) {
            if (userData?.role === 'supervisor') {
                onPageChange('supervisor')
            } else if (userData?.role === 'analyst') {
                onPageChange('analyst')
            } else {
                onPageChange('main')
            }
        }
    }

    const handleNoticeClick = () => {
        setShowNotifications(!showNotifications)
    }

    const handleNotificationClick = (id) => {
        setNotificationsList(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        )
        console.log('Нажато уведомление:', id)
    }

    const handleMarkAllRead = () => {
        setNotificationsList(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        )
    }

    const handleClearAll = () => {
        setNotificationsList([])
        setShowNotifications(false)
    }

    const handleProfileLogout = () => {
        setShowProfileModal(false)
        if (onLogout) {
            onLogout()
        }
    }

    const handleProfileBack = () => {
        setShowProfileModal(false)
        if (onPageChange) {
            // Возвращаемся на предыдущую страницу
            if (userData?.role === 'supervisor') {
                onPageChange('supervisor')
            } else if (userData?.role === 'analyst') {
                onPageChange('analyst')
            } else {
                onPageChange('main')
            }
        }
    }

    const displayName = userData?.displayName || localStorage.getItem('userDisplayName') || 'Пользователь'
    
    let roleDisplay = 'Оператор'
    if (userData?.role === 'supervisor') {
        roleDisplay = 'Супервайзер'
    } else if (userData?.role === 'analyst') {
        roleDisplay = 'Аналитик'
    }
    
    // Определяем, оператор ли пользователь
    const isOperator = userData?.role === 'operator'
    const pvzAddress = userData?.pvz?.address || 'ПВЗ №?'
    const workStart = userData?.pvz?.work_start || '10:00'
    const workEnd = userData?.pvz?.work_end || '22:00'

    return(
        <>
            <header className='headerText'>
                {isOperator ? (
                    <div className='compactLeft'>
                        <span className='point' onClick={handleLogoClick}>
                            {pvzAddress}
                        </span>
                        <span className='leftTwo'>
                            Смена: {workStart} – {workEnd}
                        </span>
                    </div>
                ) : (
                    <span className='leftTwo2'>Смена: 9:00 – 21:00</span>
                )}
                <div className='compactRight'>
                    <span className='rightOne'>{now.toLocaleTimeString()}</span>
                    <div className='bellIcon' style={{ position: 'relative', cursor: 'pointer' }} ref={notificationRef}>
                        <img onClick={handleNoticeClick} className='bellImage' src={bellIcon} alt='bell' />
                        {unreadCount > 0 && (
                            <span className='notification-badge'>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                        
                        {/* Модальное окно уведомлений */}
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
                                            <div className="no-notifications-icon"></div>
                                            <div className="no-notifications-text">Нет уведомлений</div>
                                        </div>
                                    ) : (
                                        notificationsList.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                                onClick={() => handleNotificationClick(notif.id)}
                                            >
                                                <div className="notification-dot"></div>
                                                <div className="notification-content">
                                                    <div className="notification-title">{notif.title}</div>
                                                    <div className="notification-time">{notif.time}</div>
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
                    <div className='user-info-wrapper' onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                        <div className='avatar'>
                            <img className='image' src={userData?.avatar || defaultData.image} alt='avatar' />
                        </div>
                        <div className='user-details'>
                            <div className='user-name'>
                                {displayName}
                            </div>
                            <div className='user-role'>
                                {roleDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Модальное окно профиля */}
            {showProfileModal && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal-container" ref={profileModalRef}>
                        <ProfilePage 
                            onBack={handleProfileBack}
                            onLogout={handleProfileLogout}
                            userData={userData}
                        />
                    </div>
                </div>
            )}
        </>
    )
}