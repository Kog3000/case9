// src/SupervisorPage/ReassignOperatorModal/ReassignOperatorModal.jsx
import { useState, useEffect } from 'react';
import './ReassignOperatorModal.css';

export default function ReassignOperatorModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    operators = [], 
    pvzList = [],
    isLoading = false 
}) {
    const [selectedOperatorId, setSelectedOperatorId] = useState('');
    const [selectedPvzId, setSelectedPvzId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOperators, setFilteredOperators] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Фильтрация операторов
    useEffect(() => {
        if (operators && operators.length > 0) {
            const filtered = operators.filter(op => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (op.name || '').toLowerCase().includes(searchLower) ||
                    op.id?.toString().includes(searchTerm) ||
                    (op.email || '').toLowerCase().includes(searchLower)
                );
            });
            setFilteredOperators(filtered);
        } else {
            setFilteredOperators([]);
        }
    }, [searchTerm, operators]);

    // Сброс выбора при закрытии
    useEffect(() => {
        if (!isOpen) {
            setSelectedOperatorId('');
            setSelectedPvzId('');
            setSearchTerm('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOperatorId || !selectedPvzId) {
            setError('Выберите оператора и ПВЗ');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        try {
            await onConfirm(selectedOperatorId, selectedPvzId);
            onClose();
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Ошибка при перезакреплении оператора');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const selectedOperator = operators?.find(op => op.id.toString() === selectedOperatorId);
    const selectedPvz = pvzList?.find(pvz => pvz.id.toString() === selectedPvzId);

    // Функция для получения адреса ПВЗ оператора
    const getOperatorPvzAddress = (operator) => {
        if (operator.pvz?.address) {
            return operator.pvz.address;
        }
        return `ПВЗ №${operator.pvz_id || '?'}`;
    };

    return (
        <div className="reassign-modal-overlay" onClick={onClose}>
            <div className="reassign-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="reassign-modal-header">
                    <h3>Перезакрепление оператора</h3>
                    <button className="reassign-modal-close" onClick={onClose}>×</button>
                </div>
                
                {isLoading ? (
                    <div className="reassign-modal-loading">
                        <div className="loading-spinner"></div>
                        <p>Загрузка списка операторов...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="reassign-modal-form">
                        {error && <div className="form-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Выберите оператора</label>
                            <input
                                type="text"
                                placeholder="Поиск по имени, email или ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <div className="operators-list">
                                {filteredOperators?.length > 0 ? (
                                    filteredOperators.map(operator => (
                                        <div
                                            key={operator.id}
                                            className={`operator-item ${selectedOperatorId === operator.id.toString() ? 'selected' : ''}`}
                                            onClick={() => setSelectedOperatorId(operator.id.toString())}
                                        >
                                            <div className="operator-avatar">
                                                {operator.image_url ? (
                                                    <img 
                                                        src={`https://pvz-backend.onrender.com${operator.image_url}`} 
                                                        alt={operator.name}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.classList.add('avatar-placeholder-mode');
                                                            e.target.parentElement.innerHTML = `
                                                                <div class="avatar-placeholder">
                                                                    ${operator.name?.charAt(0) || 'O'}
                                                                </div>
                                                            `;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {operator.name?.charAt(0) || 'O'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="operator-info">
                                                <span className="operator-name">{operator.name}</span>
                                                <span className="operator-email">{operator.email}</span>
                                                <div className="operator-details">
                                                    <span className="operator-id">ID: {operator.id}</span>
                                                    <span className="operator-role">Оператор</span>
                                                </div>
                                            </div>
                                            <div className="operator-current-pvz">
                                                <span className="pvz-label">Текущий ПВЗ:</span>
                                                <span className="pvz-value">{getOperatorPvzAddress(operator)}</span>
                                            </div>
                                            {selectedOperatorId === operator.id.toString() && (
                                                <div className="selected-check">✓</div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-operators">
                                        {searchTerm ? 'Операторы не найдены' : 'Нет доступных операторов'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedOperator && (
                            <div className="form-group">
                                <label>Выберите новый ПВЗ</label>
                                <div className="pvz-list">
                                    {pvzList?.map(pvz => {
                                        const isCurrentPvz = selectedOperator.pvz?.id === pvz.id || 
                                                             selectedOperator.pvz_id === pvz.id;
                                        return (
                                            <div
                                                key={pvz.id}
                                                className={`pvz-item ${selectedPvzId === pvz.id.toString() ? 'selected' : ''} ${isCurrentPvz ? 'current-pvz' : ''}`}
                                                onClick={() => !isCurrentPvz && setSelectedPvzId(pvz.id.toString())}
                                                style={isCurrentPvz ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                            >
                                                <div className="pvz-info">
                                                    <span className="pvz-address">{pvz.address}</span>
                                                    <span className="pvz-id">ID: {pvz.id}</span>
                                                    {pvz.work_start && pvz.work_end && (
                                                        <span className="pvz-work-time">
                                                            {pvz.work_start} - {pvz.work_end}
                                                        </span>
                                                    )}
                                                </div>
                                                {isCurrentPvz && (
                                                    <div className="current-pvz-badge">Текущий</div>
                                                )}
                                                {selectedPvzId === pvz.id.toString() && !isCurrentPvz && (
                                                    <div className="selected-check">✓</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedOperator && selectedPvz && (
                            <div className="reassign-preview">
                                <h4>Предпросмотр изменений:</h4>
                                <div className="preview-details">
                                    <div className="preview-item">
                                        <span className="preview-label">Оператор:</span>
                                        <span className="preview-value">{selectedOperator.name}</span>
                                    </div>
                                    <div className="preview-item">
                                        <span className="preview-label">Текущий ПВЗ:</span>
                                        <span className="preview-value old">{getOperatorPvzAddress(selectedOperator)}</span>
                                    </div>
                                    <div className="preview-arrow">→</div>
                                    <div className="preview-item">
                                        <span className="preview-label">Новый ПВЗ:</span>
                                        <span className="preview-value new">{selectedPvz.address}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="reassign-modal-actions">
                            <button type="button" className="cancel-btn" onClick={onClose}>
                                Отмена
                            </button>
                            <button 
                                type="submit" 
                                className="confirm-btn"
                                disabled={!selectedOperatorId || !selectedPvzId || isSubmitting}
                            >
                                {isSubmitting ? 'Перезакрепление...' : 'Перезакрепить'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}