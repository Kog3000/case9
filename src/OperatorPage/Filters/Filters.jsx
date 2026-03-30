import { useState } from 'react'
import Button from '../../Button/Button'
import InputCase from '../../InputCase/InputCase'
import './Filters.css'

export default function Filters({ onFilterChange }) {
    const [dateRange, setDateRange] = useState('')
    const [operationType, setOperationType] = useState('')

    const handleDateChange = (e) => {
        const value = e.target.value
        console.log('Введена дата:', value)
        setDateRange(value)
    }

    const handleOperationChange = (e) => {
        const value = e.target.value
        console.log('Введена операция:', value)
        setOperationType(value)
    }

    const handleApplyFilters = () => {
        let startDate = ''
        let endDate = ''
        
        // Парсим даты из строки формата 'ДД.ММ.ГГГГ - ДД.ММ.ГГГГ'
        if (dateRange.includes(' - ')) {
            const dates = dateRange.split(' - ')
            if (dates.length === 2) {
                startDate = dates[0].trim()
                endDate = dates[1].trim()
            }
        }
        
        console.log('Отправляемые фильтры:', { startDate, endDate, operationType })
        
        onFilterChange({
            startDate,
            endDate,
            operationType  // может быть пустой строкой ''
        })
    }

    const handleResetFilters = () => {
        setDateRange('')
        setOperationType('')
        onFilterChange({
            startDate: '',
            endDate: '',
            operationType: ''
        })
    }

    return (
        <div className='filterContainer'>
            <InputCase 
                title='Дата' 
                content='__.__.____ - __.__.____'
                value={dateRange}
                onChange={handleDateChange}
            />
            <InputCase 
                title='Тип операции (принять / выдать / вернуть)' 
                content='Все'
                value={operationType}
                onChange={handleOperationChange}
            />
            <Button content='Применить фильтры' onClick={handleApplyFilters} lengthBtn='short'/>
            <Button content='Сбросить' onClick={handleResetFilters} variant='empty' lengthBtn='short'/>
        </div>
    )
}