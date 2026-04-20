// src/SupervisorPage/CustomBar/CustomBarChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useState, useEffect, useRef } from 'react'
import { getDailyLoad } from '../../Api/statistics'
import './CustomBarChart.css'

export default function CustomBarChart({ pvzId, selectedDate }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [capacityPerHour, setCapacityPerHour] = useState(15)
  const [totalOperations, setTotalOperations] = useState(0)
  const [overloadHours, setOverloadHours] = useState(0)
  const [noData, setNoData] = useState(false) // Добавляем состояние для отсутствия данных
  
  const isMounted = useRef(true);
  const lastRequestRef = useRef({ pvzId: null, date: null });

  const getColorByValue = (value, capacity) => {
    if (value <= capacity) return '#509F6A'
    if (value <= capacity * 1.5) return '#809F50'
    if (value <= capacity * 2) return '#9F6050'
    if (value <= capacity * 2.5) return '#9a4c4e'
    return '#AA3B3B'
  }

  // Функция проверки валидности даты
  const isValidDate = (date) => {
    if (!date) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const year = parseInt(date.split('-')[0]);
    return year >= 2000 && year <= 2100;
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Загружаем данные ТОЛЬКО если оба поля заполнены и дата валидна
    if (pvzId && selectedDate && isValidDate(selectedDate)) {
      // Проверяем, не тот же ли запрос уже выполняется
      if (lastRequestRef.current.pvzId === pvzId && lastRequestRef.current.date === selectedDate) {
        console.log('⚠️ Тот же запрос уже выполняется, пропускаем');
        return;
      }
      
      console.log('✅ Условия выполнены, загружаем данные для:', { pvzId, selectedDate });
      lastRequestRef.current = { pvzId, date: selectedDate };
      loadData();
    } else {
      // Если данные не валидны - очищаем график
      console.log('⏸️ Ожидание валидных данных:', { pvzId, selectedDate });
      if (!loading) {
        setChartData([]);
        setError(null);
        setNoData(false);
      }
    }
  }, [pvzId, selectedDate])

  const loadData = async () => {
    // Дополнительная проверка перед запросом
    if (!pvzId || !selectedDate || !isValidDate(selectedDate)) {
      console.log('❌ Загрузка отменена: невалидные данные');
      return;
    }

    setLoading(true);
    setError(null);
    setNoData(false);
    
    try {
      console.log('🚀 Выполняется запрос...');
      const data = await getDailyLoad(pvzId, selectedDate);
      
      if (!isMounted.current) return;
      
      // Проверяем, есть ли данные
      if (!data || !data.hourly || data.hourly.length === 0) {
        setNoData(true);
        setChartData([]);
        return;
      }
      
      const formattedData = data.hourly.map(item => ({
        hour: `${item.hour}:00`,
        value: item.operations,
        overload: item.overload,
      }));
      
      setChartData(formattedData);
      setCapacityPerHour(data.capacity_per_hour || 15);
      setTotalOperations(data.total_operations || 0);
      setOverloadHours(data.overload_hours || 0);
      setNoData(false);
      
    } catch (err) {
      console.error('Ошибка:', err);
      if (isMounted.current) {
        // Проверяем,是否是 404 ошибка (данные не найдены)
        if (err.response?.status === 404 || err.message?.includes('не найдены')) {
          setNoData(true);
          setError(null);
        } else {
        setError(err.message || 'Не удалось загрузить данные');
        }
        setChartData([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isOverload = value > capacityPerHour;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-hour">{label}</p>
          <p className="tooltip-value">
            <span>Операций:</span>
            <strong style={{ color: getColorByValue(value, capacityPerHour) }}>
              {value}
            </strong>
          </p>
          {isOverload && (
            <p className="tooltip-warning">
              ⚠️ Превышение на {value - capacityPerHour} ед.
            </p>
          )}
          <p className="tooltip-capacity">
            Норма: {capacityPerHour} оп/час
          </p>
        </div>
      );
    }
    return null;
  };

  // Состояние: не выбраны фильтры
  if (!pvzId || !selectedDate) {
    return (
      <div className="chart-container">
        <p className="chart-title">Загруженность ПВЗ</p>
        <div className="empty-state">
          Выберите ПВЗ и дату для просмотра статистики
        </div>
      </div>
    );
  }

  // Состояние: некорректная дата
  if (!isValidDate(selectedDate)) {
    return (
      <div className="chart-container">
        <p className="chart-title">Загруженность ПВЗ</p>
        <div className="empty-state">
          Пожалуйста, выберите корректную дату (например, 2026-04-13)
        </div>
      </div>
    );
  }

  // Состояние: загрузка
  if (loading) {
    return (
      <div className="chart-container">
        <p className="chart-title">Загруженность ПВЗ</p>
        <div className="loading-state">Загрузка данных...</div>
      </div>
    );
  }

  // Состояние: ошибка
 

  if (error) {
    const isServerError = error.includes('Сервер временно недоступен') || 
                          error.includes('не отвечает') ||
                          error.includes('Network Error');
    
    return (
      <div className="chart-container">
        <p className="chart-title">Загруженность ПВЗ</p>
        <div className="error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{error}</p>
          {isServerError ? (
            <div className="server-error-actions">
              <button onClick={() => window.location.reload()}>
                Перезагрузить страницу
              </button>
              <button onClick={loadData}>
                Попробовать снова
              </button>
            </div>
          ) : (
          <button onClick={loadData}>Повторить</button>
        </div>
      </div>
    );
  }

  // Состояние: пустые данные
  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <p className="chart-title">Загруженность ПВЗ</p>
        <div className="empty-state">
          Нет данных для отображения
        </div>
      </div>
    );
  }

  // Состояние: данные загружены и отображаются
  return (
    <div className="chart-container">
      <div className="chart-header">
        <p className="chart-title">Загруженность ПВЗ</p>
        <div className="chart-stats">
          <span className="stat-item">
            Всего операций: <strong>{totalOperations}</strong>
          </span>
          <span className="stat-item overload">
            Часов перегрузки: <strong>{overloadHours}</strong>
          </span>
          <span className="stat-item">
            Норма: <strong>{capacityPerHour} оп/час</strong>
          </span>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <XAxis 
              dataKey="hour" 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ddd' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 14 }}
              axisLine={{ stroke: '#ddd' }}
              label={{ value: 'Количество операций', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1000}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColorByValue(entry.value, capacityPerHour)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}