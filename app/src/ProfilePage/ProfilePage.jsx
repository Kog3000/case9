import './ProfilePage.css'
import { roles, defaultData } from '../data.js'
import bellIcon from '/assets/bellp_icon.svg'
import calendarIcon from '/assets/calendar_icon.svg'
import settingsIcon from '/assets/settings_icon.svg'

export default function ProfilePage({ onBack, onRegister, userData, onLogout }) {
    const displayName = userData?.displayName || localStorage.getItem('userDisplayName') || 'Пользователь'
    const userLogin = userData?.login || localStorage.getItem('userLogin') || 'user'
    const userEmail = userData?.email || localStorage.getItem('userEmail') || 'user@example.com'
    const userAvatar = userData?.avatar || defaultData.image

    const handleBack = () => {
        console.log('Нажата кнопка Назад')
        if (onBack) {
            onBack()
        } else {
            console.log('onBack не передан в ProfilePage')
        }
    }

    const handleLogout = () => {
        console.log('Нажата кнопка Выйти')
        console.log('onLogout функция:', onLogout)
        if (onLogout) {
            onLogout()
        } else {
            console.log('onLogout не передан в ProfilePage')
        }
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="user-header">
                    <div className='avatarLK'>
                        <img className='image' src={userAvatar} alt="avatar" />
                    </div>
                    <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        <div className="user-login">{userLogin}</div>
                        <div className="user-email">{userEmail}</div>
                    </div>
                </div>
                
                <div className="menu-section">
                    <div className="menu-item">
                        <img className='menu-icon' src={bellIcon} alt="bell" />
                        <span className="menu-text">Уведомления</span>
                    </div>
                    
                    <div className="menu-item">
                        <img className='menu-icon' src={calendarIcon} alt="calendar" />
                        <span className="menu-text">Календарь</span>
                    </div>
                    
                    <div className="menu-item">
                        <img className='menu-icon' src={settingsIcon} alt="settings" />
                        <span className="menu-text">Настройки</span>
                    </div>
                </div>
                
                <div className="actions">
                    <button onClick={handleBack} className="back-button">Назад</button>
                    <button onClick={handleLogout} className="logout-button">Выйти</button>
                </div>
            </div>
        </div>
    )
}