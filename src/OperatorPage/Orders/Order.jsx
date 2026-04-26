import './Order.css';

export default function Order({ order, onReceive, onIssue, onReturn }) {
  // Определяем текст и стиль для метки статуса
  let statusLabel = null;
  let statusClass = '';

  if (order.status === 'issued') {
    statusLabel = 'Выдан клиенту';
    statusClass = 'status-issued';
  } else if (order.status === 'returned') {
    statusLabel = 'Возврат';
    statusClass = 'status-returned';
  } else if (order.status === 'pending') {
    statusLabel = 'В рассмотрении';
    statusClass = 'status-pending';
  } else if (order.status === 'received') {
    statusLabel = 'Готов к выдаче';
    statusClass = 'status-received';
  }

  return (
    <li className="order-card">
      <div className="productInfo">
        <span className="productTitle1">{`Заказ ${order.id}`}</span>
        <span className="date">{order.date}</span>
        {statusLabel && <span className={`status-badge ${statusClass}`}>{statusLabel}</span>}
      </div>

      {order.status === 'pending' && onReceive && (
        <button className="productButton" onClick={onReceive}>
          Принять на ПВЗ
        </button>
      )}

      {order.status === 'received' && (
        <div className="buttons">
          <button className="productButton first" onClick={onIssue}>
            Выдать клиенту
          </button>
          <button className="productButton second" onClick={onReturn}>
            Вернуть на склад
          </button>
        </div>
      )}
    </li>
  );
}