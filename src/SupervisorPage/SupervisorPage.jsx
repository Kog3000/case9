// src/SupervizerPage/SupervizerPage.jsx
import { useState, useEffect } from 'react';
import { getSupervisorDeliveries, getDeliveriesForRedirect, changeDelivery } from '../Api/deliveries';
import Order from './Orders/Order';
import RedirectModal from './RedirectModal/RedirectModal';
import './SupervisorPage.css';
import CustomBarChart from './CustomBar/CustomBarChart'
import Button from '../Button/Button'

export default function SupervisorPage({ userData, onLogout }) {
  const [pvzId, setPvzId] = useState('');
  const [date, setDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Модальное окно
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveriesList, setDeliveriesList] = useState([]); // список доступных доставок

  const getErrorMessage = (err) => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(', ');
      return JSON.stringify(detail);
    }
    return err.message || 'Произошла ошибка';
  };

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

  const openRedirectModal = async (orderId) => {
    setSelectedOrderId(orderId);
    setDeliveriesList([]); // очищаем старый список
    setModalOpen(true);
    // Загружаем доступные доставки для этого заказа
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
      await handleSearch(); // обновляем список заказов
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div className="supervisor-page">
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

      {loading && <div>Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className='content-wrapper'>
        <div>
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

        <RedirectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleRedirectConfirm}
          deliveriesList={deliveriesList}
          orderId={selectedOrderId}
        />

        <div className='customBarChart'>
          <CustomBarChart></CustomBarChart>
        </div>
      </div>
    </div>
  );
}