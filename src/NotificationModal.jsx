// src/Header/NotificationModal.jsx
import { useState } from 'react';
import './NotificationModal.css';

export default function NotificationModal({ notification, onClose, onSolved }) {
    const [solution, setSolution] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const problemTypesMap = {
        'technical': 'Техническая проблема',
        'order': 'Проблема с заказом',
        'client': 'Конфликт с клиентом',
        'equipment': 'Неисправность оборудования',
        'other': 'Другое'
    };

    if (!notification) {
        return null;
    }

    const isSolved = notification.solved || notification.status === 'completed';

    const solutionText =
        notification.problem_solution ||
        notification.solution?.text ||
        '';

    const solutionDate =
        notification.solution_date ||
        notification.solution?.timestamp ||
        '';

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSolved) {
            return;
        }

        if (!solution.trim()) {
            alert('Пожалуйста, опишите решение проблемы');
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            onSolved(notification.id, {
                text: solution,
                timestamp: new Date().toISOString(),
                resolvedBy: 'Супервайзер'
            });

            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="notification-modal-overlay" onClick={onClose}>
            <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="notification-modal-header">
                    <h3>Решение проблемы</h3>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="notification-modal-body">
                    <div className="problem-info">
                        <div className="problem-title">
                            <span className="problem-icon">
                                {notification.problemType === 'technical' && ''}
                                {notification.problemType === 'order' && ''}
                                {notification.problemType === 'client' && ''}
                                {notification.problemType === 'equipment' && ''}
                                {notification.problemType === 'other' && ''}
                            </span>
                            {notification.title}
                        </div>

                        <div className="problem-details">
                            <div className="detail-item">
                                <span className="detail-label">Тип проблемы:</span>
                                <span className="detail-value">
                                    {problemTypesMap[notification.problemType] || notification.problemType}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Приоритет:</span>
                                <span className={`detail-value priority-value priority-${notification.priority}`}>
                                    {notification.priority === 'high' && 'Высокий'}
                                    {notification.priority === 'medium' && 'Средний'}
                                    {notification.priority === 'low' && 'Низкий'}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Дата создания:</span>
                                <span className="detail-value">{notification.time}</span>
                            </div>

                            {notification.operatorName && (
                                <div className="detail-item">
                                    <span className="detail-label">Оператор:</span>
                                    <span className="detail-value">{notification.operatorName}</span>
                                </div>
                            )}

                            {isSolved && solutionDate && (
                                <div className="detail-item">
                                    <span className="detail-label">Дата решения:</span>
                                    <span className="detail-value">
                                        {String(solutionDate).split('T')[0]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {notification.description && (
                            <div className="problem-description">
                                <div className="description-label">Описание проблемы:</div>
                                <div className="description-text">{notification.description}</div>
                            </div>
                        )}

                        {isSolved && (
                            <div className="problem-description">
                                <div className="description-label">Описание решения:</div>
                                <div className="description-text">
                                    {solutionText || 'Описание решения отсутствует'}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isSolved && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="solution">Решение проблемы:</label>
                                <textarea
                                    id="solution"
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                    placeholder="Опишите, как планируется решить проблему..."
                                    rows="5"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Отмена
                                </button>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Отправка...' : 'Подтвердить решение'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}