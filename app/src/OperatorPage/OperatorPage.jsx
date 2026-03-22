import { useState } from 'react'
import CustomBarChart from "./CustomBar/CustomBarChart";
import OrdersSection from "./Orders/OrdersSection";
import './OperatorPage.css'
import Filters from "./Filters/Filters";

export default function OperatorPage() {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        operationType: ''
    })

    const handleFilterChange = (newFilters) => {
        console.log('Фильтры применены:', newFilters)
        setFilters(newFilters)
    }

    return(
        <div className="content-wrapper">
            <Filters onFilterChange={handleFilterChange} />
            <OrdersSection filters={filters} />
            <CustomBarChart filters={filters} />
        </div>
    )
}