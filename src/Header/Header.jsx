import './Header.css'
import { defaultData, notifications } from '../data.js'
import { useState, useEffect, useRef } from 'react'
import bellIcon from '../../assets/bell_icon.svg'
import ProfilePage from '../ProfilePage/ProfilePage'
import { getCurrentUser } from '../Api/userService.js'

export default function Header({ onPageChange, currentPage, userName, userData, onLogout, onUserUpdate }) {
    const [now, setNow] = useState(new Date())
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [notificationsList, setNotificationsList] = useState(notifications)
    const [currentUser, setCurrentUser] = useState(userData)
    const [userNameState, setUserNameState] = useState('')
    const [userAvatar, setUserAvatar] = useState('')
    const notificationRef = useRef(null)
    const profileModalRef = useRef(null)

    // Загрузка данных пользователя с бэкенда
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userFromBackend = await getCurrentUser()
                if (userFromBackend) {
                    setCurrentUser(prev => ({ ...prev, ...userFromBackend }))
                    // Подгружаем name
                    const userName = userFromBackend.name || userFromBackend.display_name || 'Пользователь'
                    setUserNameState(userName)
                    setUserAvatar(userFromBackend.avatar || defaultData.image)
                    
                    // Сохраняем в localStorage
                    localStorage.setItem('userName', userName)
                    localStorage.setItem('userDisplayName', userName)
                    if (userFromBackend.avatar) {
                        localStorage.setItem('userAvatar', userFromBackend.avatar)
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки данных пользователя:', error)
                const localName = localStorage.getItem('userName') || 
                                 localStorage.getItem('userDisplayName') ||
                                 userData?.name ||
                                 userData?.displayName ||
                                 userName ||
                                 'Пользователь'
                const localAvatar = localStorage.getItem('userAvatar') || 
                                   userData?.avatar || 
                                   defaultData.image
                setUserNameState(localName)
                setUserAvatar(localAvatar)
            }
        }
        
        loadUserData()
    }, [userData, userName])

    // Слушаем изменения в localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const updatedName = localStorage.getItem('userName') || localStorage.getItem('userDisplayName')
            const updatedAvatar = localStorage.getItem('userAvatar')
            
            if (updatedName && updatedName !== userNameState) {
                setUserNameState(updatedName)
            }
            if (updatedAvatar && updatedAvatar !== userAvatar) {
                setUserAvatar(updatedAvatar)
            }
        }
        
        window.addEventListener('storage', handleStorageChange)
        
        const interval = setInterval(() => {
            const updatedName = localStorage.getItem('userName') || localStorage.getItem('userDisplayName')
            const updatedAvatar = localStorage.getItem('userAvatar')
            
            if (updatedName && updatedName !== userNameState) {
                setUserNameState(updatedName)
            }
            if (updatedAvatar && updatedAvatar !== userAvatar) {
                setUserAvatar(updatedAvatar)
            }
        }, 2000)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [userNameState, userAvatar])

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
            if (currentUser?.role === 'supervisor') {
                onPageChange('supervisor')
            } else if (currentUser?.role === 'analyst') {
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
            if (currentUser?.role === 'supervisor') {
                onPageChange('supervisor')
            } else if (currentUser?.role === 'analyst') {
                onPageChange('analyst')
            } else {
                onPageChange('main')
            }
        }
    }

    const handleUserUpdate = (updatedData) => {
        if (updatedData.name || updatedData.displayName) {
            const newName = updatedData.name || updatedData.displayName
            setUserNameState(newName)
            localStorage.setItem('userName', newName)
            localStorage.setItem('userDisplayName', newName)
        }
        if (updatedData.email) {
            localStorage.setItem('userEmail', updatedData.email)
        }
        if (updatedData.avatar) {
            setUserAvatar(updatedData.avatar)
            localStorage.setItem('userAvatar', updatedData.avatar)
        }
        if (onUserUpdate) {
            onUserUpdate(updatedData)
        }
    }

    let roleDisplay = 'Оператор'
    if (currentUser?.role === 'supervisor') {
        roleDisplay = 'Супервайзер'
    } else if (currentUser?.role === 'analyst') {
        roleDisplay = 'Аналитик'
    } else if (currentUser?.role === 'operator') {
        roleDisplay = 'Оператор'
    }
    
    const isOperator = currentUser?.role === 'operator'
    const pvzAddress = currentUser?.pvz?.address || userData?.pvz?.address || localStorage.getItem('pvzAddress') || 'ПВЗ №1'
    const workStart = currentUser?.pvz?.work_start || userData?.pvz?.work_start || '10:00'
    const workEnd = currentUser?.pvz?.work_end || userData?.pvz?.work_end || '22:00'

    const finalDisplayName = userNameState || 
                            currentUser?.name || 
                            currentUser?.displayName || 
                            userData?.name ||
                            userData?.displayName ||
                            userName || 
                            'Пользователь'
    
    const finalAvatar = userAvatar || currentUser?.avatar || userData?.avatar || defaultData.image

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
                        <span className='rightOne'>{now.toLocaleTimeString()}</span>
                    </div>
                ) : (
                    <span className='leftTwo2'>Смена: 9:00 – 21:00</span>
                )}
                <div className='compactRight'>
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
                            <img className='image' src={finalAvatar} alt='avatar' />
                        </div>
                        <div className='user-details'>
                            <div className='user-name'>
                                {finalDisplayName}
                            </div>
                            <div className='user-role'>
                                {roleDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {showProfileModal && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal-container" ref={profileModalRef}>
                        <ProfilePage 
                            onBack={handleProfileBack}
                            onLogout={handleProfileLogout}
                            userData={currentUser}
                            onUserUpdate={handleUserUpdate}
                        />
                    </div>
                </div>
            )}
        </>
    )
}