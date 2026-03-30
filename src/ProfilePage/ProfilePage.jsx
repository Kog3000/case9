import './ProfilePage.css'
import { defaultData } from '../data.js'

import { useState, useRef } from 'react'

import bellIcon from '/assets/bellp_icon.svg'
import cameraIcon from '/assets/camera_icon.svg'
import penIcon from '/assets/pen_icon.svg'
import calendarIcon from '/assets/calendar_icon.svg'
import settingsIcon from '/assets/settings_icon.svg'
import Button from '../Button/Button.jsx'

export default function ProfilePage({ onBack, onRegister, userData, onLogout }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [editedEmail, setEditedEmail] = useState('')
    const [avatar, setAvatar] = useState('')
    const fileInputRef = useRef(null)
    
    const displayName = userData?.displayName || localStorage.getItem('userDisplayName') || 'Пользователь'
    const userLogin = userData?.login || localStorage.getItem('userLogin') || 'user'
    const userEmail = userData?.email || localStorage.getItem('userEmail') || 'user@example.com'
    const userAvatar = avatar || userData?.avatar || localStorage.getItem('userAvatar') || defaultData.image
    const userRole = userData?.name || localStorage.getItem('userName') || 'operator'

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
        // Сохраняем изменения имени и email в localStorage
        if (editedName) localStorage.setItem('userDisplayName', editedName)
        if (editedEmail) localStorage.setItem('userEmail', editedEmail)
        
        // Сохраняем изменения в userData если есть
        if (userData) {
            userData.displayName = editedName
            userData.email = editedEmail
        }
        
        setIsEditing(false)
        console.log('Профиль обновлен:', { name: editedName, email: editedEmail })
        
        // Обновляем страницу для отображения новых данных
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
            // Проверяем размер файла (не более 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Файл слишком большой. Максимальный размер 5MB')
                return
            }
            
            // Проверяем тип файла
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение')
                return
            }
            
            const reader = new FileReader()
            reader.onloadend = () => {
                const avatarUrl = reader.result
                setAvatar(avatarUrl)
                // Сохраняем аватар в localStorage
                localStorage.setItem('userAvatar', avatarUrl)
                // Сохраняем в userData если есть
                if (userData) {
                    userData.avatar = avatarUrl
                }
                console.log('Аватар обновлен')
            }
            reader.readAsDataURL(file)
        }
    }

    // Определяем роль пользователя
    const getRoleDisplay = () => {
        switch(userRole) {
            case 'supervizer': return 'Супервайзер'
            case 'analyst': return 'Аналитик'
            case 'operator': return 'Оператор'
            default: return 'Пользователь'
        }
    }

    return (
        <div className='profile-page'>
            <div className='profile-card'>
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
                    <div className='menu-item'>
                        <img className='menu-icon' src={bellIcon} alt='bell' />
                        <span className='menu-text'>Уведомления</span>
                        <span className='menu-badge'>3</span>
                    </div>
                    
                    <div className='menu-item'>
                        <img className='menu-icon' src={calendarIcon} alt='calendar' />
                        <span className='menu-text'>Календарь</span>
                    </div>
                    
                    <div className='menu-item'>
                        <img className='menu-icon' src={settingsIcon} alt='settings' />
                        <span className='menu-text'>Настройки</span>
                    </div>
                </div>
                
                <div className='actions'>
                    <Button onClick={handleBack} content='Назад' lengthBtn='large'></Button>
                    <Button onClick={handleLogout} content='Выйти' variant='empty' lengthBtn='large'></Button>
                </div>
            </div>
        </div>
    )
}