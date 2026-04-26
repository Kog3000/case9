import './ProfilePage.css'
import { defaultData } from '../data.js'
import { useState, useRef, useEffect } from 'react'
import { updateUserName, updateUserEmail, updateUserAvatar, getCurrentUser } from '../Api/userService.js'

import cameraIcon from '/assets/camera_icon.svg'
import penIcon from '/assets/pen_icon.svg'
import bellIcon from '/assets/bellp_icon.svg'
import sunIcon from '/assets/camera_icon.svg'
import moonIcon from '/assets/camera_icon.svg'
import Button from '../Button/Button.jsx'
import Calendar from '../Calendar/Calendar.jsx'

export default function ProfilePage({ onBack, onRegister, userData, onLogout, onUserUpdate }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [editedEmail, setEditedEmail] = useState('')
    const [avatar, setAvatar] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')
    const [notificationType, setNotificationType] = useState('success')
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [isLoading, setIsLoading] = useState(false)
    const [userNameState, setUserNameState] = useState('')
    const [userEmailState, setUserEmailState] = useState('')
    const [userRoleState, setUserRoleState] = useState('')
    const [userLoginState, setUserLoginState] = useState('')
    const fileInputRef = useRef(null)
    
    // Загрузка данных пользователя с бэкенда
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userFromBackend = await getCurrentUser()
                if (userFromBackend) {
                    // Подгружаем name
                    const name = userFromBackend.name || userFromBackend.display_name || 'Пользователь'
                    setUserNameState(name)
                    
                    // Подгружаем email
                    const email = userFromBackend.email || 'user@example.com'
                    setUserEmailState(email)
                    
                    // Подгружаем role
                    const role = userFromBackend.role || userFromBackend.user_role || 'operator'
                    setUserRoleState(role)
                    
                    // Подгружаем login
                    const login = userFromBackend.login || userFromBackend.username || email.split('@')[0] || 'user'
                    setUserLoginState(login)
                    
                    // Подгружаем avatar
                    setAvatar(userFromBackend.avatar || '')
                    
                    // Сохраняем в localStorage для синхронизации
                    localStorage.setItem('userName', name)
                    localStorage.setItem('userDisplayName', name)
                    localStorage.setItem('userEmail', email)
                    localStorage.setItem('userRole', role)
                    localStorage.setItem('userLogin', login)
                    if (userFromBackend.avatar) {
                        localStorage.setItem('userAvatar', userFromBackend.avatar)
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки данных с бэкенда:', error)
                // Если бэкенд недоступен, используем данные из localStorage или userData
                setUserNameState(localStorage.getItem('userName') || userData?.name || userData?.displayName || 'Пользователь')
                setUserEmailState(localStorage.getItem('userEmail') || userData?.email || 'user@example.com')
                setUserRoleState(localStorage.getItem('userRole') || userData?.role || 'operator')
                setUserLoginState(localStorage.getItem('userLogin') || userData?.login || 'user')
                setAvatar(localStorage.getItem('userAvatar') || userData?.avatar || '')
            }
        }
        loadUserData()
    }, [userData])

    // Используем данные из состояния (с бэкенда) или из props
    const displayName = userNameState || userData?.name || userData?.displayName || localStorage.getItem('userName') || 'Пользователь'
    const userLogin = userLoginState || userData?.login || localStorage.getItem('userLogin') || 'user'
    const userEmail = userEmailState || userData?.email || localStorage.getItem('userEmail') || 'user@example.com'
    const userAvatar = avatar || userData?.avatar || localStorage.getItem('userAvatar') || defaultData.image
    const userRole = userRoleState || userData?.role || localStorage.getItem('userRole') || 'operator'

    // Применение темы
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // Автоматическое скрытие уведомления
    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showNotification])

    const showMessage = (message, type = 'success') => {
        setNotificationMessage(message)
        setNotificationType(type)
        setShowNotification(true)
    }

    const handleBack = () => {
        if (onBack) onBack()
    }

    const handleLogout = () => {
        if (onLogout) onLogout()
    }

    const handleEditProfile = () => {
        setEditedName(displayName)
        setEditedEmail(userEmail)
        setIsEditing(true)
    }

    const handleSaveChanges = async () => {
        let hasChanges = false
        let updatedName = null
        let updatedEmail = null
        
        setIsLoading(true)

        try {
            // Обновление имени
            if (editedName && editedName !== displayName) {
                if (editedName.length < 2) {
                    showMessage('Имя должно содержать минимум 2 символа', 'error')
                    setIsLoading(false)
                    return
                }
                
                await updateUserName(editedName)
                
                localStorage.setItem('userName', editedName)
                localStorage.setItem('userDisplayName', editedName)
                
                setUserNameState(editedName)
                updatedName = editedName
                hasChanges = true
                showMessage(`Имя успешно изменено на "${editedName}"`)
            }
            
            // Обновление email
            if (editedEmail && editedEmail !== userEmail) {
                if (!editedEmail.includes('@')) {
                    showMessage('Введите корректный email', 'error')
                    setIsLoading(false)
                    return
                }
                
                await updateUserEmail(editedEmail)
                localStorage.setItem('userEmail', editedEmail)
                setUserEmailState(editedEmail)
                updatedEmail = editedEmail
                hasChanges = true
                showMessage(`Email успешно изменен на "${editedEmail}"`)
            }
            
            if (!hasChanges) {
                showMessage('Нет изменений для сохранения', 'warning')
            }
            
            // Обновляем данные в родительском компоненте
            if (hasChanges && onUserUpdate) {
                onUserUpdate({ 
                    name: updatedName,
                    displayName: updatedName,
                    email: updatedEmail,
                    role: userRoleState,
                    login: userLoginState
                })
            }
            
        } catch (error) {
            console.error('Ошибка при сохранении:', error)
            showMessage(error.message || 'Произошла ошибка при сохранении', 'error')
        } finally {
            setIsLoading(false)
            setIsEditing(false)
            window.dispatchEvent(new Event('storage'))
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
    }

    const handleAvatarClick = () => {
        fileInputRef.current.click()
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Файл слишком большой. Максимальный размер 5MB', 'error')
            return
        }
        
        if (!file.type.startsWith('image/')) {
            showMessage('Пожалуйста, выберите изображение', 'error')
            return
        }
        
        const reader = new FileReader()
        reader.onloadend = () => {
            setAvatar(reader.result)
            localStorage.setItem('userAvatar', reader.result)
            if (onUserUpdate) onUserUpdate({ avatar: reader.result })
        }
        reader.readAsDataURL(file)
        
        try {
            const result = await updateUserAvatar(file)
            showMessage('Аватар успешно обновлен')
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error)
            showMessage('Аватар сохранен локально', 'warning')
        }
    }

    const handleDateSelect = (date) => {
        setSelectedDate(date)
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        showMessage(`Тема изменена на ${newTheme === 'light' ? 'светлую' : 'темную'}`)
    }

    const getRoleDisplay = () => {
        switch(userRole) {
            case 'supervisor': return 'Супервайзер'
            case 'analyst': return 'Аналитик'
            case 'operator': return 'Оператор'
            default: return userRole || 'Пользователь'
        }
    }

    return (
        <div className='profile-page'>
            <div className='profile-card'>
                <div className='profile-left'>
                    <div className='user-header'>
                        <div className='avatarLK' onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                            <img className='image' src={userAvatar} alt='avatar' />
                            <button className='change-avatar-btn' title='Сменить аватар'>
                                <img className='camera-icon' src={cameraIcon} alt='camera' />
                            </button>
                        </div>
                        <input
                            type='file'
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept='image/*'
                            onChange={handleAvatarChange}
                        />
                        <div className='user-info'>
                            {!isEditing ? (
                                <>
                                    <div className='user-name'>{displayName}</div>
                                    <div className='user-email'>{userEmail}</div>
                                    <div className='user-role-badge'>{getRoleDisplay()}</div>
                                </>
                            ) : (
                                <div className='edit-form'>
                                    <div className='edit-field'>
                                        <label>Имя</label>
                                        <input 
                                            type='text' 
                                            value={editedName} 
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className='edit-input'
                                            disabled={isLoading}
                                            placeholder="Введите имя"
                                        />
                                    </div>
                                    <div className='edit-field'>
                                        <label>Email</label>
                                        <input 
                                            type='email' 
                                            value={editedEmail} 
                                            onChange={(e) => setEditedEmail(e.target.value)}
                                            className='edit-input'
                                            disabled={isLoading}
                                            placeholder="example@mail.com"
                                        />
                                    </div>
                                    <div className='edit-actions'>
                                        <button 
                                            onClick={handleSaveChanges} 
                                            className='save-btn'
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit} 
                                            className='cancel-btn'
                                            disabled={isLoading}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isEditing && (
                            <button className='edit-profile-btn' onClick={handleEditProfile}>
                                <img className='pen-icon' src={penIcon} alt='edit' />
                            </button>
                        )}
                    </div>
                    
                    <div className='menu-section'>
                        <div className='menu-item'>
                            <img className='menu-icon' src={bellIcon} alt='bell' />
                            <span className='menu-text'>Уведомления</span>
                        </div>
                        
                        <div className='theme-switcher-item'>
                            <div className='theme-info'>
                                <img 
                                    className='theme-icon' 
                                    src={theme === 'light' ? sunIcon : moonIcon} 
                                    alt='theme' 
                                />
                                <span className='theme-text'>
                                    {theme === 'light' ? 'Светлая тема' : 'Темная тема'}
                                </span>
                            </div>
                            <button 
                                className='theme-toggle-btn'
                                onClick={toggleTheme}
                                aria-label="Переключить тему"
                            >
                                <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}>
                                    <div className="toggle-slider"></div>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div className='actions'>
                        <Button onClick={handleBack} content='Назад' lengthBtn='large'></Button>
                        <Button onClick={handleLogout} content='Выйти' variant='empty' lengthBtn='large'></Button>
                    </div>

                    {showNotification && (
                        <div className={`notification-toast ${notificationType}`}>
                            <svg className='notification-icon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{notificationMessage}</span>
                        </div>
                    )}
                </div>

                <div className='vertical-divider'></div>

                <div className='calendar-right'>
                    <Calendar onDateSelect={handleDateSelect} initialDate={selectedDate} />
                </div>
            </div>
        </div>
    )
}