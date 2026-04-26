import './Header.css'
import { defaultData, notifications } from '../data.js'
import { useState, useEffect, useRef } from 'react'
import ProfilePage from '../ProfilePage/ProfilePage'
import { getCurrentUser } from '../Api/userService.js'
import { userStorage } from '../Api/userStorageService.js'
import Notifications from '../Notifications.jsx'

export default function Header({ onPageChange, currentPage, userName, userData, onLogout, onUserUpdate }) {
    const [now, setNow] = useState(new Date())
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [currentUser, setCurrentUser] = useState(userData)
    const [userNameState, setUserNameState] = useState('')
    const [userAvatar, setUserAvatar] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null)
    const profileModalRef = useRef(null)

    // Загрузка данных пользователя с бэкенда
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userFromBackend = await getCurrentUser()
                if (userFromBackend) {
                    const userId = userFromBackend.id || userFromBackend.user_id
                    setCurrentUserId(userId)
                    userStorage.setCurrentUserId(userId)
                    
                    setCurrentUser(prev => ({ ...prev, ...userFromBackend }))
                    
                    let userName = userStorage.getUserName(userId)
                    let userAvatar = userStorage.getUserAvatar(userId)
                    
                    if (!userName) {
                        userName = userFromBackend.name || userFromBackend.display_name || 'Пользователь'
                        userStorage.setUserName(userId, userName)
                    }
                    
                    if (!userAvatar && userFromBackend.avatar) {
                        userAvatar = userFromBackend.avatar
                        userStorage.setUserAvatar(userId, userAvatar)
                    } else if (!userAvatar) {
                        userAvatar = defaultData.image
                    }
                    
                    setUserNameState(userName)
                    setUserAvatar(userAvatar)
                    
                    if (userFromBackend.role) {
                        userStorage.setUserRole(userId, userFromBackend.role)
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки данных пользователя:', error)
                const savedUserId = userStorage.getCurrentUserId()
                if (savedUserId) {
                    const savedName = userStorage.getUserName(savedUserId)
                    const savedAvatar = userStorage.getUserAvatar(savedUserId)
                    
                    setUserNameState(savedName || 'Пользователь')
                    setUserAvatar(savedAvatar || defaultData.image)
                    setCurrentUserId(savedUserId)
                } else {
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
        }
        
        loadUserData()
    }, [userData, userName])

    // Слушаем обновления данных пользователя
    useEffect(() => {
        const handleUserDataUpdate = (event) => {
            const { userId } = event.detail || {}
            if (!userId || (currentUserId && userId !== currentUserId)) return
            
            const updatedName = userStorage.getUserName(currentUserId)
            const updatedAvatar = userStorage.getUserAvatar(currentUserId)
            
            if (updatedName && updatedName !== userNameState) {
                setUserNameState(updatedName)
            }
            if (updatedAvatar && updatedAvatar !== userAvatar) {
                setUserAvatar(updatedAvatar)
            }
        }
        
        window.addEventListener('userDataUpdate', handleUserDataUpdate)
        
        return () => {
            window.removeEventListener('userDataUpdate', handleUserDataUpdate)
        }
    }, [currentUserId, userNameState, userAvatar])

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
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

    const handleProfileLogout = () => {
        setShowProfileModal(false)
        userStorage.clearCurrentUserData()
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
        const userId = userStorage.getCurrentUserId()
        if (userId) {
            if (updatedData.name || updatedData.displayName) {
                const newName = updatedData.name || updatedData.displayName
                userStorage.setUserName(userId, newName)
                setUserNameState(newName)
            }
            if (updatedData.email) {
                userStorage.setUserEmail(userId, updatedData.email)
            }
            if (updatedData.avatar) {
                userStorage.setUserAvatar(userId, updatedData.avatar)
                setUserAvatar(updatedData.avatar)
            }
        } else {
            if (updatedData.name || updatedData.displayName) {
                const newName = updatedData.name || updatedData.displayName
                localStorage.setItem('userName', newName)
                localStorage.setItem('userDisplayName', newName)
                setUserNameState(newName)
            }
            if (updatedData.email) {
                localStorage.setItem('userEmail', updatedData.email)
            }
            if (updatedData.avatar) {
                localStorage.setItem('userAvatar', updatedData.avatar)
                setUserAvatar(updatedData.avatar)
            }
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
                    {/* Компонент уведомлений */}
                    <Notifications className='notif-bell' notifications={[]} />
                    
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