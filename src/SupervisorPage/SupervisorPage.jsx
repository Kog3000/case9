import { useState, useEffect } from 'react';
import { getSupervisorDeliveries, getDeliveriesForRedirect, changeDelivery } from '../Api/deliveries';
import { changeOperatorPvz, getOperatorsList, getPvzList } from '../Api/operatorService.js';
import Order from './Orders/Order';
import RedirectModal from './RedirectModal/RedirectModal';
import ReassignOperatorModal from '../ReassignOperatorModal.jsx';
import './SupervisorPage.css';
import CustomBarChart from './CustomBar/CustomBarChart'
import Button from '../Button/Button'
import ProfilePage from '../ProfilePage/ProfilePage';
import { userStorage } from '../Api/userStorageService.js';

export default function SupervisorPage({ userData, onLogout, onUserUpdate }) {
  // Фильтры для заказов
  const [pvzId, setPvzId] = useState('');
  const [date, setDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Отдельные фильтры для диаграммы
  const [chartPvzId, setChartPvzId] = useState('');
  const [chartDate, setChartDate] = useState('');
  const [chartError, setChartError] = useState('');
  const [shouldLoadChart, setShouldLoadChart] = useState(false);

  // Состояние для модального окна профиля
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(userData);

  // Модальное окно перенаправления
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveriesList, setDeliveriesList] = useState([]);

  // Модальное окно перезакрепления оператора
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);
  const [pvzList, setPvzList] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);

  // Загрузка данных супервизора
  useEffect(() => {
    const loadSupervisorData = async () => {
      const userId = userStorage.getCurrentUserId()
      if (userId) {
        const savedData = userStorage.getUserData(userId)
        if (savedData) {
          setCurrentUserData(prev => ({ ...prev, ...savedData }))
        }
      }
    }
    loadSupervisorData()
  }, [])

  // Загрузка списка операторов и ПВЗ при открытии модалки
  const loadOperatorsAndPvz = async () => {
    setLoadingOperators(true);
    try {
      const [operators, pvz] = await Promise.all([
        getOperatorsList(),
        getPvzList()
      ]);
      setOperatorsList(operators);
      setPvzList(pvz);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Не удалось загрузить список операторов');
    } finally {
      setLoadingOperators(false);
    }
  };

  const handleOpenReassignModal = () => {
    setIsReassignModalOpen(true);
    loadOperatorsAndPvz();
  };

  const handleReassignOperator = async (operatorId, newPvzId) => {
    try {
      const result = await changeOperatorPvz(operatorId, newPvzId);
      setSuccess(`Оператор успешно перезакреплен`);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getErrorMessage = (err) => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(', ');
      return JSON.stringify(detail);
    }
    return err.message || 'Произошла ошибка';
  };

  // Поиск заказов
  const handleSearch = async () => {
    if (!pvzId || !date) {
      setError('Заполните ID ПВЗ и дату');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const items = await getSupervisorDeliveries(pvzId, date);
      const formatted = items.map(item => ({
        id: item.id,
        title: `Заказ ${item.id}`,
        status: item.status,
        date: item.delivery?.created_at || date,
        pvzId: Number(pvzId),
      }));
      setOrders(formatted);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChartSearch = () => {
    if (!chartPvzId || !chartDate) {
      setChartError('Заполните ID ПВЗ и дату для диаграммы');
      setShouldLoadChart(false);
      return;
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(chartDate)) {
      setChartError('Неверный формат даты. Используйте ГГГГ-ММ-ДД');
      setShouldLoadChart(false);
      return;
    }
    
    const year = parseInt(chartDate.split('-')[0]);
    if (year < 2000 || year > 2100) {
      setChartError('Пожалуйста, выберите корректную дату (год должен быть между 2000 и 2100)');
      setShouldLoadChart(false);
      return;
    }
    
    setChartError('');
    setShouldLoadChart(true);
  };

  const openRedirectModal = async (orderId) => {
    setSelectedOrderId(orderId);
    setDeliveriesList([]);
    setModalOpen(true);
    try {
      const deliveries = await getDeliveriesForRedirect(orderId);
      setDeliveriesList(deliveries);
    } catch (err) {
      console.error('Ошибка загрузки доступных доставок:', err);
      setError('Не удалось загрузить список доставок для перенаправления');
      setModalOpen(false);
    }
  };

  const handleRedirectConfirm = async (orderId, newDeliveryId) => {
    try {
      await changeDelivery(orderId, newDeliveryId);
      setSuccess(`Заказ ${orderId} успешно перенаправлен`);
      await handleSearch();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setModalOpen(false);
    }
  };

  const handleUserUpdate = (updatedData) => {
    const userId = userStorage.getCurrentUserId()
    if (userId) {
      userStorage.updateUserData(userId, updatedData)
    }
    setCurrentUserData(prev => ({ ...prev, ...updatedData }))
    if (onUserUpdate) {
      onUserUpdate(updatedData)
    }
  }

  // Обработчик выхода из профиля
  const handleProfileLogout = () => {
    setIsProfileModalOpen(false);
    userStorage.clearCurrentUserData();
    if (onLogout) {
      onLogout();
    }
  };

  const handleChartPvzIdChange = (e) => {
    setChartPvzId(e.target.value);
    setShouldLoadChart(false);
    setChartError('');
  };

  const handleChartDateChange = (e) => {
    setChartDate(e.target.value);
    setShouldLoadChart(false);
    setChartError('');
  };

  return (
    <div className="supervisor-page">

      {/* Блок фильтров для заказов */}
      <div className="filters">
        <input
          type="number"
          placeholder="ID ПВЗ"
          value={pvzId}
          onChange={(e) => setPvzId(e.target.value)}
          className="filter-input"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="filter-input"
        />
        <Button onClick={handleSearch} className="search-btn" content='Показать заказы'></Button>
        <Button content='Отчёт в CSV'></Button>
        
        {/* Кнопка для перезакрепления оператора */}
        <Button 
          onClick={handleOpenReassignModal} 
          className="reassign-btn" 
          content='Перезакрепить оператора'
          variant="full"
        />
      </div>

      {loading && <div>Загрузка заказов...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className='content-wrapper'>
        {/* Список заказов */}
        <div className="orders-section">
          <ul className="ordersList">
            {orders.length > 0 ? (
              orders.map(order => (
                <Order
                  key={order.id}
                  order={order}
                  onRedirect={openRedirectModal}
                />
              ))
            ) : (
              <div className="noOrders">Нет заказов</div>
            )}
          </ul>
        </div>

        {/* Блок диаграммы с отдельными фильтрами */}
        <div className="chart-section">
          <div className="chart-filters">
            <h3 className="chart-section-title">Статистика загруженности ПВЗ</h3>
            <div className="chart-filter-controls">
              <div className='filter-inputs'>
                <input
                  type="number"
                  placeholder="ID ПВЗ"
                  value={chartPvzId}
                  onChange={handleChartPvzIdChange}
                  className="filter-input first"
                />
                <input
                  type="date"
                  value={chartDate}
                  onChange={handleChartDateChange}
                  className="filter-input second"
                />
              </div>
              <Button 
                onClick={handleChartSearch} 
                className="chart-search-btn" 
                content='Показать статистику'
              />
            </div>
            {chartError && <div className="chart-error">{chartError}</div>}
          </div>
          
          <div className='customBarChart'>
            {shouldLoadChart && chartPvzId && chartDate ? (
              <CustomBarChart
                key={`${chartPvzId}-${chartDate}`}
                pvzId={chartPvzId}
                selectedDate={chartDate}
              />
            ) : (
              <div className="chart-placeholder">
                <p>Выберите ПВЗ и дату, затем нажмите "Показать статистику"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно перенаправления */}
      <RedirectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRedirectConfirm}
        deliveriesList={deliveriesList}
        orderId={selectedOrderId}
      />

      {/* Модальное окно перезакрепления оператора */}
      <ReassignOperatorModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onConfirm={handleReassignOperator}
        operators={operatorsList}
        pvzList={pvzList}
      />

      {/* Модальное окно профиля */}
      {isProfileModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="profile-modal-close" 
              onClick={() => setIsProfileModalOpen(false)}
            >
            </button>
            <ProfilePage 
              onBack={() => setIsProfileModalOpen(false)}
              onLogout={handleProfileLogout}
              userData={currentUserData}
              onUserUpdate={handleUserUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}