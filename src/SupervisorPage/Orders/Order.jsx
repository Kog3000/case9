// src/SupervizerPage/Orders/Order.jsx
import './Order.css';

export default function SupervisorOrder({ order, onRedirect }) {
  return (
    <li className="order-card">
      <div className="productInfo">
        <span className="productTitle1">{order.title}</span>
        <span className="date">Дата: {order.date}</span>
        <span className="pvz-id">ПВЗ {order.pvzId}</span>
      </div>
      <button className="productButton" onClick={() => onRedirect(order.id)}>
        Перенаправить в другой ПВЗ
      </button>
    </li>
  );
}