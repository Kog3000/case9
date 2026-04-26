import './ProfilePage.css'
import { defaultData } from '../data.js'
import { useState, useRef, useEffect } from 'react'
import { updateUserName, updateUserAvatar, fetchUserProfile, parseJwt } from '../Api/userService.js'
import { userStorage } from '../Api/userStorageService.js'

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
    const [avatar, setAvatar] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')
    const [notificationType, setNotificationType] = useState('success')
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [isLoading, setIsLoading] = useState(false)
    const [userNameState, setUserNameState] = useState('')
    const [userEmailState, setUserEmailState] = useState('')
    const [userId, setUserId] = useState(null)
    const fileInputRef = useRef(null)
    
    // Загрузка данных пользователя с бэка
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const profile = await fetchUserProfile();
                console.log('ProfilePage - профиль с бэка:', profile);
                
                let userName = profile.name || profile.display_name || profile.username;
                let userEmail = profile.email;
                let userAvatarUrl = profile.avatar;
                let userRole = profile.role;
                let userIdFromBack = profile.id || profile.user_id;
                
                if (userName && userName !== 'Пользователь') {
                    setUserNameState(userName);
                    setUserEmailState(userEmail || '');
                    setAvatar(userAvatarUrl || '');
                    
                    if (userIdFromBack) {
                        setUserId(userIdFromBack);
                        userStorage.setCurrentUserId(userIdFromBack.toString());
                        userStorage.setUserName(userIdFromBack.toString(), userName);
                        if (userEmail) userStorage.setUserEmail(userIdFromBack.toString(), userEmail);
                        if (userRole) userStorage.setUserRole(userIdFromBack.toString(), userRole);
                        if (userAvatarUrl) userStorage.setUserAvatar(userIdFromBack.toString(), userAvatarUrl);
                    }
                } else {
                    // Fallback на токен
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        const tokenData = parseJwt(token);
                        if (tokenData) {
                            let fallbackName = tokenData.name || tokenData.username || tokenData.email?.split('@')[0] || 'Пользователь';
                            setUserNameState(fallbackName);
                            setUserEmailState(tokenData.email || '');
                        }
                    }
                }
            } catch (error) {
                console.error('ProfilePage - ошибка загрузки:', error);
                // Fallback на localStorage
                const token = localStorage.getItem('access_token');
                if (token) {
                    const tokenData = parseJwt(token);
                    if (tokenData) {
                        let fallbackName = tokenData.name || tokenData.username || tokenData.email?.split('@')[0] || 'Пользователь';
                        setUserNameState(fallbackName);
                        setUserEmailState(tokenData.email || '');
                    }
                }
            }
        };
        
        loadUserData();
    }, []);

    const displayName = userNameState || 'Пользователь'
    const userEmail = userEmailState || 'user@example.com'
    const userAvatar = avatar || defaultData.image
    const userRole = userStorage.getUserRole(userId) || localStorage.getItem('userRole') || userData?.role || 'operator'

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

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
        setIsEditing(true)
    }

    const handleSaveChanges = async () => {
        let hasChanges = false
        let updatedName = null
        
        setIsLoading(true)

        try {
            if (editedName && editedName !== displayName) {
                if (editedName.length < 3) {
                    showMessage('Имя должно содержать минимум 3 символа', 'error')
                    setIsLoading(false)
                    return
                }
                
                if (editedName.length > 50) {
                    showMessage('Имя не должно превышать 50 символов', 'error')
                    setIsLoading(false)
                    return
                }
                
                try {
                    await updateUserName(editedName)
                    showMessage(`Имя успешно изменено на "${editedName}"`)
                } catch (apiError) {
                    console.warn('API ошибка, сохраняем локально:', apiError.message);
                    showMessage(`Имя "${editedName}" сохранено локально`, 'warning')
                }
                
                const currentUserId = userStorage.getCurrentUserId() || userId;
                if (currentUserId) {
                    userStorage.setUserName(currentUserId, editedName);
                }
                
                setUserNameState(editedName);
                updatedName = editedName;
                hasChanges = true;
            }
            
            if (!hasChanges) {
                showMessage('Нет изменений для сохранения', 'warning');
            }
            
            if (hasChanges && onUserUpdate) {
                onUserUpdate({ 
                    name: updatedName,
                    displayName: updatedName
                });
            }
            
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            showMessage(error.message || 'Произошла ошибка при сохранении', 'error');
        } finally {
            setIsLoading(false);
            setIsEditing(false);
            const currentUserId = userStorage.getCurrentUserId() || userId;
            window.dispatchEvent(new CustomEvent('userDataUpdate', { 
                detail: { userId: currentUserId, name: updatedName }
            }));
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(false);
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
            
            const currentUserId = userStorage.getCurrentUserId() || userId
            if (currentUserId) {
                userStorage.setUserAvatar(currentUserId, reader.result)
            }
            
            if (onUserUpdate) onUserUpdate({ avatar: reader.result })
            
            window.dispatchEvent(new CustomEvent('userDataUpdate', { 
                detail: { userId: currentUserId, avatar: reader.result }
            }))
        }
        reader.readAsDataURL(file)
        
        try {
            await updateUserAvatar(file)
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
            default: return 'Пользователь'
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
                                            placeholder="Введите имя (мин. 3 символа)"
                                        />
                                    </div>
                                    <div className='edit-field'>
                                        <label>Email</label>
                                        <div className='email-display-field'>
                                            <input 
                                                type='email' 
                                                value={userEmail} 
                                                className='edit-input email-readonly'
                                                disabled={true}
                                                readOnly
                                            />
                                            <span className='readonly-badge'>Неизменяемое поле</span>
                                        </div>
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