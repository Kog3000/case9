import './Header.css'
import {points, roles} from './data.js'
import { useState } from "react"
import bellIcon from '../assets/bell_icon.svg'


export default function Header() {
    const [now, setNow] = useState(new Date())

    setInterval(() => setNow(new Date()), 1000)

    return(
        <header className='headerText'>
            <div className="compactLeft">
                <span className='point'>{points[0]}</span>
                <span className='leftTwo'>Смена: 10.00–22.00</span>
            </div>
            <div className="compactRight">
                <span className='rightOne'>{now.toLocaleTimeString()}</span>
                <div className='bellIcon'>
                    <img className='bellImage' src={bellIcon}></img>
                </div>
                <div className='avatar'>
                    <img className='image'></img>
                </div>
                <span>{roles[0].displayName}</span>
            </div>
        </header>
    )
}