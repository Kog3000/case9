import {orders} from '../../data.js'
import Order from './Order'
import './OrderSection.css'

export default function OrdersSection() {
    const startDate = '12.03.2026'
    const endDate = '21.03.2026'

    const filteredOrders = orders.filter(order => {
        if (!order.date) return false;
        return order.date >= startDate && order.date <= endDate;
    })

    return(
        <section className='mainBody'>
            <ul className='ordersList'>
            {filteredOrders.map(order => <Order key={order.title} {...order}></Order>)}
            </ul>
        </section>
    )
}