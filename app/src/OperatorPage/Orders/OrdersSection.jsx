import { useState, useEffect } from 'react'
import { orders } from '../../data.js'
import Order from './Order'
import './OrdersSection.css'

export default function OrdersSection({ filters }) {
    const [filteredOrders, setFilteredOrders] = useState([])

    const parseDate = (dateStr) => {
        if (!dateStr) return null
        const [day, month, year] = dateStr.split('.')
        const date = new Date(year, month - 1, day)
        return isNaN(date.getTime()) ? null : date
    }

    // Функция нормализации текста (замена ё на е, приведение к нижнему регистру)
    const normalizeText = (text) => {
        if (!text) return ''
        return text.toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/\s+/g, ' ')
            .trim()
    }

    // Функция для получения статуса по тексту
    const getStatusFromText = (text) => {
        const normalized = normalizeText(text)
        
        // Проверка на "принять" и его варианты
        if (normalized === 'принять' || 
            normalized === 'прием' || 
            normalized === 'принять на склад' ||
            normalized === 'прием на склад' ||
            normalized.includes('принять') ||
            normalized.includes('прием')) {
            return 1
        }
        
        // Проверка на "выдать" и его варианты
        if (normalized === 'выдать' || 
            normalized === 'выдать клиенту' ||
            normalized.includes('выдать')) {
            return 2
        }
        
        // Проверка на "вернуть" и его варианты
        if (normalized === 'вернуть' || 
            normalized === 'вернуть на склад' ||
            normalized.includes('вернуть')) {
            return 2
        }
        
        // Проверка на "склад" - возвращает массив статусов 1 и 3
        if (normalized.includes('склад')) {
            return [1, 2]
        }
        
        return null
    }

    useEffect(() => {
        console.log('Получены фильтры в OrdersSection:', filters)
        
        let filtered = [...orders]

        // ========== ФИЛЬТРАЦИЯ ПО ДАТЕ ==========
        const hasStartDate = filters.startDate && filters.startDate.trim() !== ''
        const hasEndDate = filters.endDate && filters.endDate.trim() !== ''
        
        if (hasStartDate || hasEndDate) {
            const start = hasStartDate ? parseDate(filters.startDate) : null
            const end = hasEndDate ? parseDate(filters.endDate) : null
            
            filtered = filtered.filter(order => {
                if (!order.date) return false
                const orderDate = parseDate(order.date)
                if (!orderDate) return false
                
                if (start && end) {
                    return orderDate >= start && orderDate <= end
                }
                if (start && !end) {
                    return orderDate >= start
                }
                if (!start && end) {
                    return orderDate <= end
                }
                return true
            })
            console.log('После фильтрации по дате:', filtered.length)
        }

        // ========== ФИЛЬТРАЦИЯ ПО ТИПУ ОПЕРАЦИИ ==========
        const hasOperationType = filters.operationType && 
                                  filters.operationType.trim() !== '' && 
                                  filters.operationType !== 'Все'
        
        if (hasOperationType) {
            const filterStatus = getStatusFromText(filters.operationType)
            
            if (filterStatus) {
                if (Array.isArray(filterStatus)) {
                    // Если несколько статусов (например, "склад")
                    filtered = filtered.filter(order => filterStatus.includes(order.status))
                    console.log('Фильтрация по нескольким статусам:', filterStatus)
                } else {
                    // Одиночный статус
                    filtered = filtered.filter(order => order.status === filterStatus)
                    console.log('Фильтрация по статусу:', filterStatus)
                }
            } else {
                // Если не распознано, пробуем частичное совпадение
                const normalizedFilter = normalizeText(filters.operationType)
                filtered = filtered.filter(order => {
                    let statusText = ''
                    if (order.status === 1) statusText = 'Приём на склад'
                    else if (order.status === 2 || order.status === 3) statusText = 'Выдать клиенту'
                    else if (order.status === 3 || order.status === 2) statusText = 'Вернуть на склад'
                    
                    const normalizedStatus = normalizeText(statusText)
                    return normalizedStatus.includes(normalizedFilter)
                })
            }
            console.log('После фильтрации по операции:', filtered.length)
        }

        console.log('Всего отфильтровано заказов:', filtered.length)
        setFilteredOrders(filtered)
        
    }, [filters])

    // Определяем, какие фильтры активны
    const hasDateFilter = (filters.startDate && filters.startDate.trim() !== '') || 
                          (filters.endDate && filters.endDate.trim() !== '')
    const hasOperationFilter = filters.operationType && 
                               filters.operationType.trim() !== '' && 
                               filters.operationType !== 'Все'

    return(
        <section className='mainBody'>
            <div className="orders-header">
                <h3>Заказы ({filteredOrders.length})</h3>
                {(hasDateFilter || hasOperationFilter) && (
                    <div className="filter-info">
                        <span className="filter-badge">Фильтры активны</span>
                        <div className="filter-details">
                            {hasDateFilter && (
                                <span className="filter-detail">
                                    {filters.startDate || '...'} - {filters.endDate || '...'}
                                </span>
                            )}
                            {hasOperationFilter && (
                                <span className="filter-detail">
                                    {filters.operationType}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ul className='ordersList'>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <Order 
                            key={order.id || order.title} 
                            title={order.title}
                            status={order.status}
                            price={order.price}
                            article={order.article}
                            date={order.date}
                        />
                    ))
                ) : (
                    <div className="noOrders">
                        Нет заказов за выбранный период
                    </div>
                )}
            </ul>
        </section>
    )
}