import Button from "./Button/Button";
import InputCase from "./InputCase/InputCase";
import './SupervizerPage.css'

export default function SupervizerPage() {
    return(
        <div className='filters'>
            <InputCase title='Пункт выдачи заказов' content='ПВЗ №1'></InputCase>
            <InputCase title='Дата' content='__.__.____ - __.__.____'></InputCase>
            <InputCase title='Тип операции' content='Все'></InputCase>
            <Button content='Получить статистику'></Button>
        </div>
    )
}