import { useState } from 'react';
import Filters from './Filters/Filters';
import OrdersSection from './Orders/OrdersSection';
import SupportTicket from '../../src/SupportTicket';
import './OperatorPage.css'

export default function OperatorPage({ userData, onLogout }) {
    const [filters, setFilters] = useState({ created_date: null, status_order: null });

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleTicketSubmit = (ticket) => {
        console.log('Заявка отправлена:', ticket);
        // Здесь можно добавить отправку на сервер
        // Или уведомление супервизору
    };

    return (
        <div className='content-wrapper'>
            <div className='filters-section'>
                <Filters onFilterChange={handleFilterChange} />
            </div>
            <div className='orders-section'>
                <OrdersSection filters={filters} />
            </div>
            <div className='support-section'>
                <SupportTicket userData={userData} onSubmit={handleTicketSubmit} />
            </div>
        </div>
    );
}