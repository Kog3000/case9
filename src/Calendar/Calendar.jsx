import { useState } from 'react';
import './Calendar.css';

export default function Calendar({ onDateSelect, initialDate = null }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate);

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days = [];
        
        // Добавляем пустые ячейки для начала месяца
        for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
            days.push(null);
        }
        
        // Добавляем дни месяца
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const changeMonth = (increment) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        handleDateSelect(today);
    };

    const handleDateSelect = (date) => {
        if (date) {
            setSelectedDate(date);
            if (onDateSelect) {
                onDateSelect(date);
            }
        }
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    const isWeekend = (date) => {
        if (!date) return false;
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className="custom-calendar">
            <div className="calendar-header">
                <button onClick={() => changeMonth(-1)} className="calendar-nav" title="Предыдущий месяц">
                    &#10094;
                </button>
                <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                <button onClick={() => changeMonth(1)} className="calendar-nav" title="Следующий месяц">
                    &#10095;
                </button>
            </div>
            
            <div className="calendar-weekdays">
                {weekDays.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}
            </div>
            
            <div className="calendar-days">
                {days.map((date, index) => (
                    <div 
                        key={index} 
                        className={`calendar-day 
                            ${!date ? 'empty' : ''} 
                            ${date && isToday(date) ? 'today' : ''} 
                            ${date && isSelected(date) ? 'selected' : ''}
                            ${date && isWeekend(date) ? 'weekend' : ''}
                        `}
                        onClick={() => handleDateSelect(date)}
                    >
                        {date && date.getDate()}
                    </div>
                ))}
            </div>
            
            <div className="calendar-footer">
                <button onClick={goToToday} className="today-btn">
                    Сегодня
                </button>
                {selectedDate && (
                    <div className="selected-date">
                        Выбрано: {selectedDate.toLocaleDateString('ru-RU')}
                    </div>
                )}
            </div>
        </div>
    );
}