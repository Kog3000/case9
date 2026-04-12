import { useState } from 'react';
import Button from '../../Button/Button';
import './Filters.css';

export default function Filters({ onFilterChange }) {
    const [dateStr, setDateStr] = useState('');
    const [status, setStatus] = useState('');

    const handleDateChange = (e) => {
        setDateStr(e.target.value); // значение в формате YYYY-MM-DD
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleApplyFilters = () => {
        onFilterChange({
            created_date: dateStr || null,
            status_order: status || null,
        });
    };

    const handleResetFilters = () => {
        setDateStr('');
        setStatus('');
        onFilterChange({
            created_date: null,
            status_order: null,
        });
    };

    return (
        <div className="filterContainer">
            <div className="filter-group">
                <p className="filter-label">Дата</p>
                <input
                    type="date"
                    value={dateStr}
                    onChange={handleDateChange}
                    className="date-input"
                />
            </div>
            <div className="filter-group">
                <p className="filter-label">Статус заказов</p>
                <select value={status} onChange={handleStatusChange} className="status-select">
                    <option value="">Все</option>
                    <option value="pending">В рассмотрении (pending)</option>
                    <option value="received">Готов к выдаче (received)</option>
                    <option value="issued">Выдан клиенту (issued)</option>
                    <option value="returned">Возврат (returned)</option>
                </select>
            </div>
            <div className="actions">
                <Button content="Применить фильтры" onClick={handleApplyFilters} lengthBtn="short" />
                <Button content="Сбросить" onClick={handleResetFilters} variant="empty" lengthBtn="short" />
            </div>
        </div>
    );
}