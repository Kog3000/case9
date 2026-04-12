import { useState, useEffect } from 'react';
import { getDeliveries, receiveItem, updateOrderStatus } from '../../Api/deliveries';
import Order from './Order';
import TimeModal from './TimeModal';
import './OrdersSection.css';

export default function OrdersSection({ filters }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // Передаём параметры фильтрации в API
      const items = await getDeliveries(
        filters?.created_date || null,
        filters?.status_order || null
      );
      const formattedOrders = items.map(item => ({
        id: item.id,
        title: `Заказ ${item.id}`,
        status: item.status,
        date: item.delivery?.created_at || null,
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError('Нет доступных заказов');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем заказы при монтировании и при изменении фильтров
  useEffect(() => {
    loadOrders();
  }, [filters]); // Важно: фильтры могут быть undefined, но useEffect сработает

  const openModal = (orderId, status) => {
    setSelectedOrderId(orderId);
    setTargetStatus(status);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
    setTargetStatus(null);
  };

  const confirmTime = async (time) => {
    if (!selectedOrderId || !targetStatus) return;

    // Обрезаем до HH:MM, игнорируем секунды, если они есть
    let formattedTime = time;
    if (time.length > 5) {
      formattedTime = time.slice(0, 5);
    }

    try {
      if (targetStatus === 'received') {
        await receiveItem(selectedOrderId, formattedTime);
      } else {
        await updateOrderStatus(selectedOrderId, targetStatus, formattedTime);
      }
      setSuccessMessage(`Заказ ${selectedOrderId} успешно обновлён`);
      await loadOrders(); // обновляем список после изменения статуса
    } catch (err) {
      console.error('Ошибка при обновлении статуса заказа:', err);
      setError(err.message || 'Не удалось обновить статус заказа');
    } finally {
      closeModal();
    }
  };

  return (
    <section className="mainBody">
      <div className="orders-header">
        <h3>Заказы ({orders.length})</h3>
      </div>

      {loading && <div className="loading">Загрузка заказов...</div>}
      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}

      {!loading && !error && (
        <ul className="ordersList">
          {orders.length > 0 ? (
            orders.map(order => (
              <Order
                key={order.id}
                order={order}
                onReceive={order.status === 'pending' ? () => openModal(order.id, 'received') : null}
                onIssue={order.status === 'received' ? () => openModal(order.id, 'issued') : null}
                onReturn={order.status === 'received' ? () => openModal(order.id, 'returned') : null}
              />
            ))
          ) : (
            <div className="noOrders">Нет заказов</div>
          )}
        </ul>
      )}

      <TimeModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmTime}
      />
    </section>
  );
}