// SupportTicket.jsx
import { useState } from 'react';
import './SupportTicket.css';
import Button from './Button/Button';
import { createOperatorNotification, fetchOperatorAllNotifications } from './Api/notificationService';

export default function SupportTicket({ userData, onSubmit }) {
    const [problemType, setProblemType] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [notificationsHistory, setNotificationsHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const problemTypes = [
        { value: 'technical', label: 'Техническая проблема' },
        { value: 'order', label: 'Проблема с заказом' },
        { value: 'client', label: 'Конфликт с клиентом' },
        { value: 'equipment', label: 'Неисправность оборудования' },
        { value: 'other', label: 'Другое' }
    ];

    const priorities = [
        { value: 'high', label: 'Высокий', color: '#ef4444' },
        { value: 'medium', label: 'Средний', color: '#f39c12' },
        { value: 'low', label: 'Низкий', color: '#2ecc71' }
    ];

    const statusMap = {
        new: { label: 'Новая', color: '#3498db' },
        in_progress: { label: 'В работе', color: '#f39c12' },
        completed: { label: 'Завершена', color: '#2ecc71' },
        cancelled: { label: 'Отменена', color: '#e74c3c' }
    };

    const problemTypeMapReverse = {
        1: 'Техническая проблема',
        2: 'Проблема с заказом',
        3: 'Конфликт с клиентом',
        4: 'Неисправность оборудования',
        5: 'Другое'
    };

    const priorityMapReverse = {
        1: 'Высокий',
        2: 'Средний',
        3: 'Низкий'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!problemType || !description) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        if (description.trim().length < 3) {
            alert('Описание должно быть минимум 3 символа');
            return;
        }

        setIsSubmitting(true);
        setShowSuccess(false);

        try {
            const createdNotification = await createOperatorNotification({
                problemType,
                priority,
                description
            });

            if (onSubmit) {
                onSubmit(createdNotification);
            }

            setShowSuccess(true);

            setProblemType('');
            setDescription('');
            setPriority('medium');

            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Ошибка отправки заявки:', error);
            alert(error.message || 'Не удалось отправить заявку');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenHistory = async () => {
        setShowHistoryModal(true);
        setIsLoadingHistory(true);
        setHistoryError(null);
        
        try {
            const history = await fetchOperatorAllNotifications();
            console.log('Полученные заявки:', history); // Для отладки
            setNotificationsHistory(history);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            setHistoryError(error.message || 'Не удалось загрузить историю заявок');
            setNotificationsHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleCloseHistory = () => {
        setShowHistoryModal(false);
        setNotificationsHistory([]);
        setHistoryError(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="support-ticket">
                <div className="support-header">
                    <h3>Обращение к супервайзеру</h3>
                    <p>Опишите проблему, и мы оперативно ее решим</p>
                </div>

                <form onSubmit={handleSubmit} className="ticket-form">
                    <div className="form-group">
                        <label>Тип проблемы</label>
                        <select 
                            value={problemType} 
                            onChange={(e) => setProblemType(e.target.value)}
                            className="form-select"
                            required
                        >
                            <option value="">Выберите тип проблемы</option>
                            {problemTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Приоритет</label>
                        <div className="priority-buttons">
                            {priorities.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    className={`priority-btn ${priority === p.value ? 'active' : ''}`}
                                    style={{
                                        borderColor: p.color,
                                        backgroundColor: priority === p.value ? p.color : 'transparent',
                                        color: priority === p.value ? 'white' : p.color
                                    }}
                                    onClick={() => setPriority(p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Описание проблемы</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-textarea"
                            placeholder="Опишите подробно ситуацию..."
                            rows="4"
                            required
                        />
                    </div>
                    
                    <div className='btns'>
                        <Button disabled={isSubmitting} content={isSubmitting ? 'Отправка...' : 'Отправить заявку'} />
                        <Button onClick={handleOpenHistory} content='Мои отправленные заявки'></Button>
                    </div>

                    {showSuccess && (
                        <div className="success-message">
                            ✓ Заявка успешно отправлена супервизору
                        </div>
                    )}
                </form>
            </div>

            {/* Модальное окно истории заявок */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={handleCloseHistory}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Мои отправленные заявки</h3>
                            <button className="modal-close" onClick={handleCloseHistory}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            {isLoadingHistory && (
                                <div className="history-loading">
                                    <div className="spinner"></div>
                                    <p>Загрузка заявок...</p>
                                </div>
                            )}
                            
                            {historyError && (
                                <div className="history-error">
                                    <p>{historyError}</p>
                                    <button onClick={handleOpenHistory} className="retry-btn">
                                        Повторить
                                    </button>
                                </div>
                            )}
                            
                            {!isLoadingHistory && !historyError && notificationsHistory.length === 0 && (
                                <div className="history-empty">
                                    <p>У вас пока нет отправленных заявок</p>
                                    <small>Заполните форму выше, чтобы создать заявку</small>
                                </div>
                            )}
                            
                            {!isLoadingHistory && !historyError && notificationsHistory.length > 0 && (
                                <div className="history-list">
                                    {notificationsHistory.map((notification) => (
                                        <div key={notification.id} className="history-item">
                                            <div className="history-item-header">
                                                <span className="history-id">Заявка #{notification.id}</span>
                                                <span 
                                                    className="history-status"
                                                    style={{ 
                                                        backgroundColor: statusMap[notification.status_notification]?.color || '#95a5a6',
                                                        color: 'white'
                                                    }}
                                                >
                                                    {statusMap[notification.status_notification]?.label || notification.status_notification}
                                                </span>
                                            </div>
                                            
                                            <div className="history-item-content">
                                                <div className="history-field">
                                                    <strong>Тип проблемы:</strong>
                                                    <span>{problemTypeMapReverse[notification.type_problem] || 'Неизвестно'}</span>
                                                </div>
                                                
                                                <div className="history-field">
                                                    <strong>Приоритет:</strong>
                                                    <span 
                                                        className="history-priority"
                                                        style={{
                                                            color: notification.priority === 1 ? '#ef4444' : 
                                                                   notification.priority === 2 ? '#f39c12' : '#2ecc71',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {priorityMapReverse[notification.priority] || 'Неизвестно'}
                                                    </span>
                                                </div>
                                                
                                                <div className="history-field">
                                                    <strong>Описание:</strong>
                                                    <p className="history-description">{notification.message}</p>
                                                </div>
                                                
                                                {notification.problem_solution && (
                                                    <div className="history-field solution-field">
                                                        <strong>Решение супервайзера:</strong>
                                                        <p className="history-solution">{notification.problem_solution}</p>
                                                    </div>
                                                )}
                                                
                                                <div className="history-field">
                                                    <strong>Дата создания:</strong>
                                                    <span>{formatDate(notification.created_at)}</span>
                                                </div>
                                                
                                                {notification.updated_at && notification.updated_at !== notification.created_at && (
                                                    <div className="history-field">
                                                        <strong>Последнее обновление:</strong>
                                                        <span>{formatDate(notification.updated_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button onClick={handleCloseHistory} className="close-modal-btn">
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}