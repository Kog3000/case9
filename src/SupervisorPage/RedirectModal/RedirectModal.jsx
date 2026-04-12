// src/SupervizerPage/RedirectModal/RedirectModal.jsx
import { useState } from 'react';
import './RedirectModal.css';

export default function RedirectModal({ isOpen, onClose, onConfirm, deliveriesList, orderId }) {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedDeliveryId) {
      alert('Выберите доставку для перенаправления');
      return;
    }
    onConfirm(orderId, Number(selectedDeliveryId));
    onClose();
  };

  return (
    <div className="redirect-modal-overlay" onClick={onClose}>
      <div className="redirect-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="redirect-modal-title">Перенаправить заказ</h3>
        <p className="redirect-modal-order">Заказ №{orderId}</p>
        <div className="redirect-modal-field">
          <label>Выберите новую доставку (ПВЗ):</label>
          <select
            value={selectedDeliveryId}
            onChange={(e) => setSelectedDeliveryId(e.target.value)}
            className="redirect-modal-select"
          >
            <option value="">-- Выберите доставку --</option>
            {deliveriesList.map(delivery => (
              <option key={delivery.id} value={delivery.id}>
                ПВЗ {delivery.pvz?.id || '?'} – {delivery.pvz?.address || 'Адрес не указан'} (доставка №{delivery.id})
              </option>
            ))}
          </select>
        </div>
        <div className="redirect-modal-buttons">
          <button className="redirect-modal-btn confirm" onClick={handleConfirm}>
            Подтвердить
          </button>
          <button className="redirect-modal-btn cancel" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}