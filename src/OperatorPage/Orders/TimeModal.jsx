// src/OperatorPage/Orders/TimeModal.jsx
import { useState, useEffect } from 'react';
import './TimeModal.css';

export default function TimeModal({ isOpen, onClose, onConfirm }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      setTime(currentTime);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(time);
    }
    onClose();
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h4>Введите время операции (ЧЧ:ММ)</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="current-time-hint">
          Текущее время: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
          autoFocus
        />
        
        <div className="modal-buttons">
          <button onClick={handleConfirm}>Подтвердить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}