import './ProfilePage.css'
import {roles} from './data.js'

export default function ProfilePage({ onBack }) {
    return (
        <div>
            <div className='avatar'>
                <img className='image'/>
            </div>
            <div>
                <span>{roles[0].displayName}</span>
                <span>{roles[0].login}</span>
            </div>
            <div>
                <span>Уведомления</span>
            </div>
            <div>
                <span>Календарь</span>
            </div>
            <div>
                <span>Настройки</span>
            </div>
            <button onClick={onBack} className="back-button">Назад</button>
            <button>Выйти</button>
        </div>   
    )
}