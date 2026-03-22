import {orders} from '../data.js'
import Order from './Order'
import './OrderSection.css'

export default function OrdersSection() {
    return(
        <section className='mainBody'>
            <ul className='ordersList'>
            {orders.map(order => <Order key={order.title} {...order}></Order>)}

            {/* <Order title={orders[0].title} status={orders[0].status} price={orders[0].price} artilce={orders[0].article}></Order>
            <Order title={orders[1].title} status={orders[1].status} price={orders[1].price} artilce={orders[1].article}></Order>
            <Order title={orders[2].title} status={orders[2].status} price={orders[2].price} artilce={orders[2].article}></Order>
            <Order title={orders[3].title} status={orders[3].status} price={orders[3].price} artilce={orders[3].article}></Order> */}
            </ul>
        </section>
    )
}