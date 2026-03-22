import { useState, useEffect } from 'react'
import { orders } from '../../data.js'
import Order from './Order'
import './OrdersSection.css'

export default function OrdersSection({ filters }) {
    const [filteredOrders, setFilteredOrders] = useState([])

    const parseDate = (dateStr) => {
        if (!dateStr) return null
        const [day, month, year] = dateStr.split('.')
        return new Date(year, month - 1, day)
    }

    useEffect(() => {
        let filtered = [...orders]

        // Фильтрация по дате
        if (filters.startDate && filters.endDate) {
            const start = parseDate(filters.startDate)
            const end = parseDate(filters.endDate)
            
            filtered = filtered.filter(order => {
                if (!order.date) return false
                const orderDate = parseDate(order.date)
                return orderDate >= start && orderDate <= end
            })
        }

        // Фильтрация по типу операции (status)
        if (filters.operationType && filters.operationType.trim() !== '') {
            filtered = filtered.filter(order => {
                let statusText = ''
                if (order.status === 1) statusText = 'Приём на склад'
                else if (order.status === 2) statusText = 'Выдать клиенту'
                else if (order.status === 3) statusText = 'Вернуть на склад'
                
                return statusText.toLowerCase().includes(filters.operationType.toLowerCase())
            })
        }

        setFilteredOrders(filtered)
    }, [filters])

    return(
        <section className='mainBody'>
            <div className="orders-header">
                <h3>Заказы ({filteredOrders.length})</h3>
                {(filters.startDate || filters.endDate || filters.operationType) && (
                    <span className="filter-badge">Фильтры активны</span>
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