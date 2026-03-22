import Button from '../../Button/Button'
import InputCase from '../../InputCase/InputCase'
import './Filters.css'

export default function Filters() {
    return (
        <div className='filterContainer'>
            <InputCase title='Дата' content='__.__.____ - __.__.____'></InputCase>
            <InputCase title='Тип операции' content='Приём на склад'></InputCase>
            <Button content='Применить фильтры'></Button>
        </div>
    )
}