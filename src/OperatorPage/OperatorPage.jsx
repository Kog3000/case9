import { useState } from 'react';
import Filters from './Filters/Filters';
import OrdersSection from './Orders/OrdersSection';
import './OperatorPage.css'

export default function OperatorPage({ userData, onLogout }) {
    const [filters, setFilters] = useState({ created_date: null, status_order: null });

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className='content-wrapper'>
            <Filters onFilterChange={handleFilterChange} />
            <OrdersSection filters={filters} />
        </div>
    );
}