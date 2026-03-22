import './Header.css'
import { points, defaultData } from '../data.js'
import { useState, useEffect } from "react"
import bellIcon from '../../assets/bell_icon.svg'

export default function Header({ onPageChange, currentPage, userName, userData, onLogout }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleProfileClick = () => {
        if (onPageChange) {
            onPageChange('profile')
        }
    }

    const handleLogoClick = () => {
        if (onPageChange) {
            if (userName === 'supervizer') {
                onPageChange('supervizer')
            } else if (userName === 'analyst') {
                onPageChange('analyst')
            } else {
                onPageChange('main')
            }
        }
    }

    const displayName = userData?.displayName || localStorage.getItem('userDisplayName') || 'Пользователь'
    
    // Определяем отображаемую роль
    let roleDisplay = 'Оператор'
    if (userName === 'supervizer') {
        roleDisplay = 'Супервайзер'
    } else if (userName === 'analyst') {
        roleDisplay = 'Аналитик'
    }
    
    const currentUserName = localStorage.getItem('userName') || userName

    return(
        <header className='headerText'>
            <div className="compactLeft">
                {currentUserName === 'operator' && (
                    <span className='point' onClick={handleLogoClick}>
                        {points[0]}
                    </span>
                )}
                <span className='leftTwo'>Смена: 10.00–22.00</span>
            </div>
            <div className="compactRight">
                <span className='rightOne'>{now.toLocaleTimeString()}</span>
                <div className='bellIcon'>
                    <img className='bellImage' src={bellIcon} alt="bell" />
                </div>
                <div className="user-info-wrapper" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                    <div className='avatar'>
                        <img className='image' src={userData?.avatar || defaultData.image} alt="avatar" />
                    </div>
                    <div className="user-details">
                        <div className="user-name">
                            {displayName}
                        </div>
                        <div className="user-role">
                            {roleDisplay}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}