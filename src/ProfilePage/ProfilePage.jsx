import './ProfilePage.css'
import { defaultData } from '../data.js'
import { useState, useRef, useEffect } from 'react'
import {
    updateUserName,
    updateUserAvatar,
    fetchUserProfile,
    parseJwt,
    deleteUserAvatar,
    getFullImageUrl
} from '../Api/userService.js'

import cameraIcon from '/assets/camera_icon.svg'
import penIcon from '/assets/pen_icon.svg'
import bellIcon from '/assets/bellp_icon.svg'
import sunIcon from '/assets/camera_icon.svg'
import moonIcon from '/assets/camera_icon.svg'
import Button from '../Button/Button.jsx'
import Calendar from '../Calendar/Calendar.jsx'

const STORAGE_KEYS = {
    USER_ID: 'app_user_id',
    USER_NAME: 'app_user_name',
    USER_EMAIL: 'app_user_email',
    USER_ROLE: 'app_user_role',
    USER_AVATAR: 'app_user_avatar'
}

export default function ProfilePage({ onBack, onRegister, userData, onLogout, onUserUpdate }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState('')

    const [avatar, setAvatar] = useState(() => {
        return getFullImageUrl(localStorage.getItem(STORAGE_KEYS.USER_AVATAR)) || ''
    })

    const [selectedDate, setSelectedDate] = useState(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')
    const [notificationType, setNotificationType] = useState('success')
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [isLoading, setIsLoading] = useState(false)
    const [userNameState, setUserNameState] = useState('')
    const [userEmailState, setUserEmailState] = useState('')
    const [userId, setUserId] = useState(null)
    const [userRole, setUserRole] = useState('operator')
    const fileInputRef = useRef(null)

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const profile = await fetchUserProfile();
                console.log('ProfilePage - профиль:', profile);

                let userName = profile.name || profile.display_name || profile.username;
                let userEmail = profile.email;
                let userAvatarUrl = profile.image_url;
                let userRoleFromProfile = profile.role;
                let userIdFromBack = profile.id || profile.user_id;

                if (userName && userName !== 'Пользователь') {
                    setUserNameState(userName);
                    setUserEmailState(userEmail || '');
                    setUserRole(userRoleFromProfile || 'operator');

                    if (userIdFromBack) {
                        setUserId(userIdFromBack);
                        localStorage.setItem(STORAGE_KEYS.USER_ID, userIdFromBack.toString());
                        localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
                        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userEmail || '');
                        localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRoleFromProfile || 'operator');
                    }

                    // Аватар: сначала из профиля, потом из localStorage, потом дефолт
                    const finalAvatar = getFullImageUrl(
                        userAvatarUrl || localStorage.getItem(STORAGE_KEYS.USER_AVATAR)
                    ) || defaultData.image;

                    setAvatar(finalAvatar);
                    localStorage.setItem(STORAGE_KEYS.USER_AVATAR, finalAvatar);
                } else {
                    const token = localStorage.getItem('access_token');

                    if (token) {
                        const tokenData = parseJwt(token);

                        if (tokenData) {
                            let fallbackName =
                                tokenData.name ||
                                tokenData.email?.split('@')[0] ||
                                tokenData.sub?.split('@')[0] ||
                                'Пользователь';

                            setUserNameState(fallbackName);
                            setUserEmailState(tokenData.email || tokenData.sub || '');
                            setUserRole(tokenData.role || 'operator');

                            const savedAvatar = getFullImageUrl(
                                localStorage.getItem(STORAGE_KEYS.USER_AVATAR) || tokenData.image_url
                            );

                            if (savedAvatar) {
                                setAvatar(savedAvatar);
                                localStorage.setItem(STORAGE_KEYS.USER_AVATAR, savedAvatar);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('ProfilePage - ошибка:', error);

                const token = localStorage.getItem('access_token');

                if (token) {
                    const tokenData = parseJwt(token);

                    if (tokenData) {
                        let fallbackName =
                            tokenData.name ||
                            tokenData.email?.split('@')[0] ||
                            tokenData.sub?.split('@')[0] ||
                            'Пользователь';

                        setUserNameState(fallbackName);
                        setUserEmailState(tokenData.email || tokenData.sub || '');
                        setUserRole(tokenData.role || 'operator');

                        const savedAvatar = getFullImageUrl(
                            localStorage.getItem(STORAGE_KEYS.USER_AVATAR) || tokenData.image_url
                        );

                        if (savedAvatar) {
                            setAvatar(savedAvatar);
                            localStorage.setItem(STORAGE_KEYS.USER_AVATAR, savedAvatar);
                        }
                    }
                }
            }
        };

        loadUserData();
    }, []);

    useEffect(() => {
        const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
        if (storedRole && !userRole) setUserRole(storedRole);
    }, [userRole]);

    // Слушаем внешние обновления аватара (например, из Header)
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { userId: eventUserId, image_url } = event.detail || {};
            const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

            if ((eventUserId && String(eventUserId) === String(currentUserId)) && image_url) {
                const normalizedAvatar = getFullImageUrl(image_url);

                if (normalizedAvatar) {
                    setAvatar(normalizedAvatar);
                    localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedAvatar);
                }
            }
        };

        window.addEventListener('userAvatarUpdate', handleAvatarUpdate);
        return () => window.removeEventListener('userAvatarUpdate', handleAvatarUpdate);
    }, []);

    const displayName = userNameState || 'Пользователь'
    const userEmail = userEmailState || 'user@example.com'
    const userAvatar = getFullImageUrl(avatar) || defaultData.image
    const finalUserRole = userRole || userData?.role || 'operator'

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => setShowNotification(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showNotification])

    const showMessage = (message, type = 'success') => {
        setNotificationMessage(message)
        setNotificationType(type)
        setShowNotification(true)
    }

    const handleBack = () => onBack?.()
    const handleLogout = () => onLogout?.()

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
                if (editedName.length < 3 || editedName.length > 50) {
                    showMessage('Имя должно быть от 3 до 50 символов', 'error')
                    setIsLoading(false)
                    return
                }

                try {
                    const result = await updateUserName(editedName)
                    showMessage(`Имя изменено на "${editedName}"`)

                    const newName = result?.name || editedName
                    setUserNameState(newName)
                    updatedName = newName
                } catch (apiError) {
                    console.warn('API ошибка, сохранено локально:', apiError)
                    showMessage(`Имя "${editedName}" сохранено локально`, 'warning')

                    localStorage.setItem(STORAGE_KEYS.USER_NAME, editedName)
                    setUserNameState(editedName)
                    updatedName = editedName
                }

                hasChanges = true
            }

            if (!hasChanges) {
                showMessage('Нет изменений', 'warning')
            } else if (onUserUpdate) {
                onUserUpdate({ name: updatedName, displayName: updatedName })
            }
        } catch (error) {
            showMessage(error.message || 'Ошибка сохранения', 'error')
        } finally {
            setIsLoading(false)
            setIsEditing(false)

            const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)

            window.dispatchEvent(new CustomEvent('userDataUpdate', {
                detail: {
                    userId: currentUserId,
                    name: updatedName
                }
            }))
        }
    }

    const handleCancelEdit = () => setIsEditing(false)
    const handleAvatarClick = () => fileInputRef.current.click()

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Валидация
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Файл не более 5MB', 'error')
            return
        }

        if (!file.type.startsWith('image/')) {
            showMessage('Выберите изображение', 'error')
            return
        }

        // Локальное превью (оптимистичное обновление)
        const reader = new FileReader()

        reader.onloadend = () => {
            const base64 = reader.result
            setAvatar(base64)

            const userId = localStorage.getItem(STORAGE_KEYS.USER_ID)

            if (userId) {
                localStorage.setItem(STORAGE_KEYS.USER_AVATAR, base64)

                if (onUserUpdate) {
                    onUserUpdate({
                        avatar: base64,
                        image_url: base64
                    })
                }

                window.dispatchEvent(new CustomEvent('userAvatarUpdate', {
                    detail: {
                        userId,
                        image_url: base64
                    }
                }))
            }
        }

        reader.readAsDataURL(file)

        // Отправка на сервер
        try {
            const result = await updateUserAvatar(file)
            const permanentUrl = getFullImageUrl(result?.image_url || result?.avatar)

            if (permanentUrl && permanentUrl !== avatar) {
                setAvatar(permanentUrl)

                const userId = localStorage.getItem(STORAGE_KEYS.USER_ID)

                if (userId) {
                    localStorage.setItem(STORAGE_KEYS.USER_AVATAR, permanentUrl)

                    if (onUserUpdate) {
                        onUserUpdate({
                            avatar: permanentUrl,
                            image_url: permanentUrl
                        })
                    }

                    window.dispatchEvent(new CustomEvent('userAvatarUpdate', {
                        detail: {
                            userId,
                            image_url: permanentUrl
                        }
                    }))
                }
            }

            showMessage('Аватар обновлён')
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error)
            showMessage('Аватар сохранён локально (сервер недоступен)', 'warning')
        } finally {
            e.target.value = ''
        }
    }

    const handleDateSelect = (date) => setSelectedDate(date)

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        showMessage(`Тема: ${newTheme === 'light' ? 'светлая' : 'тёмная'}`)
    }

    const getRoleDisplay = () => {
        switch(finalUserRole) {
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
                                            placeholder="3-50 символов"
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
                                        <button onClick={handleSaveChanges} className='save-btn' disabled={isLoading}>
                                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button onClick={handleCancelEdit} className='cancel-btn' disabled={isLoading}>
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