import './ProfilePage.css'
import { defaultData } from '../data.js'

import { useState, useRef, useEffect } from 'react'

import cameraIcon from '/assets/camera_icon.svg'
import penIcon from '/assets/pen_icon.svg'
import settingsIcon from '/assets/settings_icon.svg'
import bellIcon from '/assets/bellp_icon.svg'
import sunIcon from '/assets/camera_icon.svg'
import moonIcon from '/assets/camera_icon.svg'
import Button from '../Button/Button.jsx'
import Calendar from '../Calendar/Calendar.jsx'

export default function ProfilePage({ onBack, onRegister, userData, onLogout }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [editedEmail, setEditedEmail] = useState('')
    const [avatar, setAvatar] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const fileInputRef = useRef(null)
    
    const displayName = userData?.displayName || localStorage.getItem('userDisplayName') || 'Пользователь'
    const userLogin = userData?.login || localStorage.getItem('userLogin') || 'user'
    const userEmail = userData?.email || localStorage.getItem('userEmail') || 'user@example.com'
    const userAvatar = avatar || userData?.avatar || localStorage.getItem('userAvatar') || defaultData.image
    const userRole = userData?.name || localStorage.getItem('userName') || 'operator'

    // Применение темы ко всему документу
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // Автоматическое скрытие уведомления через 3 секунды
    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showNotification])

    const handleBack = () => {
        console.log('Нажата кнопка Назад')
        if (onBack) {
            onBack()
        }
    }

    const handleLogout = () => {
        console.log('Нажата кнопка Выйти')
        if (onLogout) {
            onLogout()
        }
    }

    const handleEditProfile = () => {
        setEditedName(displayName)
        setEditedEmail(userEmail)
        setIsEditing(true)
    }

    const handleSaveChanges = () => {
        let hasChanges = false
        let changesList = []
        
        if (editedName && editedName !== displayName) {
            localStorage.setItem('userDisplayName', editedName)
            if (userData) {
                userData.displayName = editedName
            }
            hasChanges = true
            changesList.push('имя')
        }
        
        if (editedEmail && editedEmail !== userEmail) {
            localStorage.setItem('userEmail', editedEmail)
            if (userData) {
                userData.email = editedEmail
            }
            hasChanges = true
            changesList.push('email')
        }
        
        if (hasChanges) {
            let message = `Изменения сохранены`
            if (changesList.length > 0) {
                message += ` (${changesList.join(', ')})`
            }
            setNotificationMessage(message)
            setShowNotification(true)
            console.log('Профиль обновлен:', { name: editedName, email: editedEmail })
        } else {
            setNotificationMessage('Нет изменений для сохранения')
            setShowNotification(true)
        }
        
        setIsEditing(false)
        window.dispatchEvent(new Event('storage'))
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
    }

    const handleAvatarClick = () => {
        fileInputRef.current.click()
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Файл слишком большой. Максимальный размер 5MB')
                return
            }
            
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение')
                return
            }
            
            const reader = new FileReader()
            reader.onloadend = () => {
                const avatarUrl = reader.result
                setAvatar(avatarUrl)
                localStorage.setItem('userAvatar', avatarUrl)
                if (userData) {
                    userData.avatar = avatarUrl
                }
                setNotificationMessage('Аватар успешно обновлен')
                setShowNotification(true)
                console.log('Аватар обновлен')
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDateSelect = (date) => {
        setSelectedDate(date)
        console.log('Выбрана дата:', date.toLocaleDateString('ru-RU'))
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        setNotificationMessage(`Тема изменена на ${newTheme === 'light' ? 'светлую' : 'темную'}`)
        setShowNotification(true)
    }

    const getRoleDisplay = () => {
        switch(userRole) {
            case 'supervisor': return 'Супервайзер'
            case 'analyst': return 'Аналитик'
            case 'operator': return 'Оператор'
            default: return 'Пользователь'
        }
    }

    return (
        <div className='profile-page'>
            <div className='profile-card'>
                {/* Левая часть - профиль */}
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
                                    <div className='user-login'>{userLogin}</div>
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
                                        />
                                    </div>
                                    <div className='edit-field'>
                                        <label>Email</label>
                                        <input 
                                            type='email' 
                                            value={editedEmail} 
                                            onChange={(e) => setEditedEmail(e.target.value)}
                                            className='edit-input'
                                        />
                                    </div>
                                    <div className='edit-actions'>
                                        <button onClick={handleSaveChanges} className='save-btn'>Сохранить</button>
                                        <button onClick={handleCancelEdit} className='cancel-btn'>Отмена</button>
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
                        <div className='menu-item settings-item'>
                            <img className='menu-icon' src={bellIcon}/>
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

                    {/* Плашка уведомления */}
                    {showNotification && (
                        <div className='notification-toast'>
                            <svg className='notification-icon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{notificationMessage}</span>
                        </div>
                    )}
                </div>

                {/* Вертикальный разделитель */}
                <div className='vertical-divider'></div>

                {/* Правая часть - календарь */}
                <div className='calendar-right'>
                    <Calendar onDateSelect={handleDateSelect} initialDate={selectedDate} />
                </div>
            </div>
        </div>
    )
}