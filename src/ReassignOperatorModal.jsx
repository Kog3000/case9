// src/SupervisorPage/ReassignOperatorModal/ReassignOperatorModal.jsx
import { useState, useEffect } from 'react';
import './ReassignOperatorModal.css';

export default function ReassignOperatorModal({ isOpen, onClose, onConfirm, operators, pvzList }) {
    const [selectedOperatorId, setSelectedOperatorId] = useState('');
    const [selectedPvzId, setSelectedPvzId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOperators, setFilteredOperators] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (operators) {
            const filtered = operators.filter(op => 
                op.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                op.id?.toString().includes(searchTerm)
            );
            setFilteredOperators(filtered);
        }
    }, [searchTerm, operators]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOperatorId || !selectedPvzId) {
            alert('Выберите оператора и ПВЗ');
            return;
        }
        
        setIsLoading(true);
        try {
            await onConfirm(selectedOperatorId, selectedPvzId);
            handleReset();
            onClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedOperatorId('');
        setSelectedPvzId('');
        setSearchTerm('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    const selectedOperator = operators?.find(op => op.id.toString() === selectedOperatorId);
    const selectedPvz = pvzList?.find(pvz => pvz.id.toString() === selectedPvzId);

    return (
        <div className="reassign-modal-overlay" onClick={handleClose}>
            <div className="reassign-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="reassign-modal-header">
                    <h3>Перезакрепление оператора</h3>
                    <button className="reassign-modal-close" onClick={handleClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="reassign-modal-form">
                    <div className="form-group">
                        <label>Выберите оператора</label>
                        <input
                            type="text"
                            placeholder="Поиск по имени или ID..."
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
                                        <div className="operator-info">
                                            <span className="operator-name">{operator.name || operator.display_name}</span>
                                            <span className="operator-id">ID: {operator.id}</span>
                                        </div>
                                        <div className="operator-current-pvz">
                                            Текущий ПВЗ: {operator.pvz?.address || `ПВЗ №${operator.pvz_id}` || 'Не указан'}
                                        </div>
                                        {selectedOperatorId === operator.id.toString() && (
                                            <div className="selected-check">✓</div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-operators">Операторы не найдены</div>
                            )}
                        </div>
                    </div>

                    {selectedOperator && (
                        <div className="form-group">
                            <label>Выберите новый ПВЗ</label>
                            <div className="pvz-list">
                                {pvzList?.map(pvz => (
                                    <div
                                        key={pvz.id}
                                        className={`pvz-item ${selectedPvzId === pvz.id.toString() ? 'selected' : ''}`}
                                        onClick={() => setSelectedPvzId(pvz.id.toString())}
                                    >
                                        <div className="pvz-info">
                                            <span className="pvz-address">{pvz.address}</span>
                                            <span className="pvz-id">ID: {pvz.id}</span>
                                        </div>
                                        {selectedPvzId === pvz.id.toString() && (
                                            <div className="selected-check">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedOperator && selectedPvz && (
                        <div className="reassign-preview">
                            <h4>Предпросмотр изменений:</h4>
                            <p>Оператор <strong>{selectedOperator.name}</strong> будет перезакреплен</p>
                            <p>с ПВЗ <strong>{selectedOperator.pvz?.address || `ПВЗ №${selectedOperator.pvz_id}`}</strong></p>
                            <p>на ПВЗ <strong>{selectedPvz.address}</strong></p>
                        </div>
                    )}

                    <div className="reassign-modal-actions">
                        <button type="button" className="cancel-btn" onClick={handleClose}>
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className="confirm-btn"
                            disabled={!selectedOperatorId || !selectedPvzId || isLoading}
                        >
                            {isLoading ? 'Перезакрепление...' : 'Перезакрепить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}