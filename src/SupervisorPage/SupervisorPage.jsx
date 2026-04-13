// src/SupervizerPage/SupervizerPage.jsx
import { useState, useEffect } from 'react';
import { getSupervisorDeliveries, getDeliveriesForRedirect, changeDelivery } from '../Api/deliveries';
import Order from './Orders/Order';
import RedirectModal from './RedirectModal/RedirectModal';
import './SupervisorPage.css';
import CustomBarChart from './CustomBar/CustomBarChart'
import Button from '../Button/Button'

export default function SupervisorPage({ userData, onLogout }) {
  // Фильтры для заказов
  const [pvzId, setPvzId] = useState('');
  const [date, setDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Отдельные фильтры для диаграммы
  const [chartPvzId, setChartPvzId] = useState('');
  const [chartDate, setChartDate] = useState('');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState('');
  const [chartKey, setChartKey] = useState(0); // Для принудительного обновления

  // Модальное окно
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveriesList, setDeliveriesList] = useState([]);

  const getErrorMessage = (err) => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(', ');
      return JSON.stringify(detail);
    }
    return err.message || 'Произошла ошибка';
  };

  // Поиск заказов
  const handleSearch = async () => {
    if (!pvzId || !date) {
      setError('Заполните ID ПВЗ и дату');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const items = await getSupervisorDeliveries(pvzId, date);
      const formatted = items.map(item => ({
        id: item.id,
        title: `Заказ ${item.id}`,
        status: item.status,
        date: item.delivery?.created_at || date,
        pvzId: Number(pvzId),
      }));
      setOrders(formatted);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Отдельный поиск для диаграммы
  // SupervisorPage.jsx - обновите handleChartSearch
  const handleChartSearch = () => {
    if (!chartPvzId || !chartDate) {
      setChartError('Заполните ID ПВЗ и дату для диаграммы');
      return;
    }
    
    // Проверка формата даты
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(chartDate)) {
      setChartError('Неверный формат даты. Используйте ГГГГ-ММ-ДД');
      return;
    }
    
    const year = parseInt(chartDate.split('-')[0]);
    if (year < 2000 || year > 2100) {
      setChartError('Пожалуйста, выберите корректную дату (год должен быть между 2000 и 2100)');
      return;
    }
    
    setChartError('');
    // Просто обновляем ключ, данные загрузятся через useEffect в CustomBarChart
    setChartKey(prev => prev + 1);
  };

  const openRedirectModal = async (orderId) => {
    setSelectedOrderId(orderId);
    setDeliveriesList([]);
    setModalOpen(true);
    try {
      const deliveries = await getDeliveriesForRedirect(orderId);
      setDeliveriesList(deliveries);
    } catch (err) {
      console.error('Ошибка загрузки доступных доставок:', err);
      setError('Не удалось загрузить список доставок для перенаправления');
      setModalOpen(false);
    }
  };

  const handleRedirectConfirm = async (orderId, newDeliveryId) => {
    try {
      await changeDelivery(orderId, newDeliveryId);
      setSuccess(`Заказ ${orderId} успешно перенаправлен`);
      await handleSearch();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div className="supervisor-page">
      {/* Блок фильтров для заказов */}
      <div className="filters">
        <input
          type="number"
          placeholder="ID ПВЗ"
          value={pvzId}
          onChange={(e) => setPvzId(e.target.value)}
          className="filter-input"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="filter-input"
        />
        <Button onClick={handleSearch} className="search-btn" content='Показать заказы'></Button>
        <Button content='Отчёт в CSV'></Button>
      </div>

      {loading && <div>Загрузка заказов...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className='content-wrapper'>
        {/* Список заказов */}
        <div className="orders-section">
          <ul className="ordersList">
            {orders.length > 0 ? (
              orders.map(order => (
                <Order
                  key={order.id}
                  order={order}
                  onRedirect={openRedirectModal}
                />
              ))
            ) : (
              <div className="noOrders">Нет заказов</div>
            )}
          </ul>
        </div>

        {/* Блок диаграммы с отдельными фильтрами */}
        <div className="chart-section">
          <div className="chart-filters">
            <h3 className="chart-section-title">Статистика загруженности ПВЗ</h3>
            <div className="chart-filter-controls">
              <div className='filter-inputs'>
                <input
                  type="number"
                  placeholder="ID ПВЗ"
                  value={chartPvzId}
                  onChange={(e) => setChartPvzId(e.target.value)}
                  className="filter-input first"
                />
                <input
                  type="date"
                  value={chartDate}
                  onChange={(e) => setChartDate(e.target.value)}
                  className="filter-input second"
                />
              </div>
              <Button 
                onClick={handleChartSearch} 
                className="chart-search-btn" 
                content='Показать статистику'
              />
            </div>
            {chartError && <div className="chart-error">{chartError}</div>}
          </div>
          
          <div className='customBarChart'>
            {(chartPvzId && chartDate) ? (
              <CustomBarChart
                key={chartKey}
                pvzId={chartPvzId}
                selectedDate={chartDate}
              />
            ) : (
              <div className="chart-placeholder">
                <p>Выберите ПВЗ и дату, затем нажмите "Показать статистику"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RedirectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRedirectConfirm}
        deliveriesList={deliveriesList}
        orderId={selectedOrderId}
      />
    </div>
  );
}