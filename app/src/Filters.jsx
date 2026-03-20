import './Filters.css'

export default function Filters() {
    return (
        <div className='filterContainer'>
            <div>
                <p>Дата</p>
                <input className='dateInput' placeholder='__.__.____ - __.__.____ '></input>
            </div>
            <div>
                <p>Тип операции</p>
                <input className='operationInput' placeholder='Приём на склад'></input>
            </div>
            <button className='button'>Применить фильтры</button>
        </div>
    )
}