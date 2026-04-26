// SupportTicket.jsx
import { useState } from 'react';
import './SupportTicket.css';
import Button from './Button/Button';

export default function SupportTicket({ userData, onSubmit }) {
    const [problemType, setProblemType] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!problemType || !description) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        setIsSubmitting(true);

        const ticketData = {
            id: Date.now(),
            problemType,
            description,
            priority,
            status: 'new',
            createdAt: new Date().toISOString(),
            user: {
                name: userData?.displayName || localStorage.getItem('userDisplayName') || 'Оператор',
                login: userData?.login || localStorage.getItem('userLogin') || 'operator',
                pvz: userData?.pvz || 'ПВЗ №1'
            }
        };

        // Сохраняем в localStorage для демонстрации
        const existingTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        existingTickets.push(ticketData);
        localStorage.setItem('supportTickets', JSON.stringify(existingTickets));

        // Вызываем callback если передан
        if (onSubmit) {
            onSubmit(ticketData);
        }

        // Показываем успех
        setShowSuccess(true);
        
        // Очищаем форму
        setTimeout(() => {
            setProblemType('');
            setDescription('');
            setPriority('medium');
            setIsSubmitting(false);
            
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        }, 1000);
    };

    return (
        <div className="support-ticket">
            <div className="support-header">
                <h3>Обращение к супервизору</h3>
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

                <Button disabled={isSubmitting} content={isSubmitting ? 'Отправка...' : 'Отправить заявку'}></Button>

                {showSuccess && (
                    <div className="success-message">
                        ✓ Заявка успешно отправлена супервизору
                    </div>
                )}
            </form>
        </div>
    );
}