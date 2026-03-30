// src/OperatorPage/Orders/Order.jsx
import './Order.css';


export default function Order({ order, onReceive, onIssue, onReturn }) {
  const isProcessed = order.status === 'issued' || order.status === 'returned';

  return (
    <li className="order-card">
      <div className="productInfo">
        <span className="productTitle1">{`Заказ ${order.id}`}</span>
        <span className="date">{order.date}</span>
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

      {isProcessed && (
        <span className="processed-label">Обработан</span>
      )}
    </li>
  );
}
