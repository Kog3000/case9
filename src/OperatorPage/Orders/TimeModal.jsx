// src/OperatorPage/Orders/TimeModal.jsx
import { useState } from 'react';
import './TimeModal.css'; // создадим стили ниже

export default function TimeModal({ isOpen, onClose, onConfirm }) {
  const [time, setTime] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h4>Введите время операции (HH:MM)</h4>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={() => onConfirm(time)}>Подтвердить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}