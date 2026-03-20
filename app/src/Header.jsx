import './Header.css'
import { points, roles } from './data.js'
import { useState, useEffect } from "react"
import bellIcon from '../assets/bell_icon.svg'

export default function Header({ onPageChange }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer) // Очищаем интервал при размонтировании
    }, [])

    const handleRoleClick = () => {
        console.log('Клик по роли') // Для отладки
        onPageChange('profile') // Переключаем на страницу профиля
    }

    const handleLogoClick = () => {
        console.log('Клик по лого') // Для отладки
        onPageChange('main') // Возврат на главную
    }

    return(
        <header className='headerText'>
            <div className="compactLeft">
                <span 
                    className='point' 
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                >
                    {points[0]}
                </span>
                <span className='leftTwo'>Смена: 10.00–22.00</span>
            </div>
            <div className="compactRight">
                <span className='rightOne'>{now.toLocaleTimeString()}</span>
                <div className='bellIcon'>
                    <img className='bellImage' src={bellIcon} alt="bell" />
                </div>
                <div className='avatar'>
                    <img className='image'/>
                </div>
                <span 
                    onClick={handleRoleClick}
                    style={{ cursor: 'pointer' }}
                >
                    {roles[0].displayName}
                </span>
            </div>
        </header>
    )
}