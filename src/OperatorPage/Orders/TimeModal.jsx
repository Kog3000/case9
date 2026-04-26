// src/OperatorPage/Orders/TimeModal.jsx
import { useState, useEffect } from 'react';
import './TimeModal.css';

export default function TimeModal({ isOpen, onClose, onConfirm }) {
  const [time, setTime] = useState('');

  // Автоматическое выставление текущего времени при открытии модального окна
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
        <h4>Введите время операции (ЧЧ:ММ)</h4>
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