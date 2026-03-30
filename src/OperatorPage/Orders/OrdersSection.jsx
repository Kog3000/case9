import { useState, useEffect } from 'react';
import { getDeliveries, receiveItem, updateOrderStatus } from '../../Api/deliveries';
import Order from './Order';
import TimeModal from './TimeModal';
import './OrdersSection.css';

export default function OrdersSection() {
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
      const deliveries = await getDeliveries();
      const items = deliveries.flatMap(delivery =>
        delivery.items.map(item => ({
          id: item.id,
          title: `Заказ ${item.id}`,
          status: item.status,
          date: delivery.created_at,
        }))
      );
      setOrders(items);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError('Нет доступных заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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
    formattedTime = time.slice(0,5);
  }

  try {
    if (targetStatus === 'received') {
      await receiveItem(selectedOrderId, formattedTime);
    } else {
      await updateOrderStatus(selectedOrderId, targetStatus, formattedTime);
    }
    setSuccessMessage(`Заказ ${selectedOrderId} успешно обновлён`);
    await loadOrders();
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