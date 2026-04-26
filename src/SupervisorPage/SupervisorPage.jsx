import { useState, useEffect } from 'react';
import { getSupervisorDeliveries, getDeliveriesForRedirect, changeDelivery } from '../Api/deliveries';
import { changeOperatorPvz, getOperatorsList, getPvzList } from '../Api/operatorService';
import { fetchUserProfile, parseJwt } from '../Api/userService';
import { userStorage } from '../Api/userStorageService.js';
import Order from './Orders/Order';
import RedirectModal from './RedirectModal/RedirectModal';
import ReassignOperatorModal from './ReassignOperatorModal';
import './SupervisorPage.css';
import CustomBarChart from './CustomBar/CustomBarChart'
import Button from '../Button/Button'
import ProfilePage from '../ProfilePage/ProfilePage';


export default function SupervisorPage({ userData, onLogout, onUserUpdate }) {
  const [pvzId, setPvzId] = useState('');
  const [date, setDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [chartPvzId, setChartPvzId] = useState('');
  const [chartDate, setChartDate] = useState('');
  const [chartError, setChartError] = useState('');
  const [shouldLoadChart, setShouldLoadChart] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(userData);
  const [currentUserName, setCurrentUserName] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveriesList, setDeliveriesList] = useState([]);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);
  const [pvzList, setPvzList] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);

 useEffect(() => {
    // Принудительно загружаем имя из userStorage при загрузке страницы
    const userId = userStorage.getCurrentUserId();
    if (userId) {
        const savedName = userStorage.getUserName(userId);
        if (savedName && savedName !== 'Пользователь' && savedName !== 'undefined') {
            setCurrentUserName(savedName);
            setCurrentUserData(prev => ({ ...prev, name: savedName, displayName: savedName }));
            return;
        }
    }
    
    // Если нет сохраненного имени, загружаем профиль
    loadUserProfile();
}, []);

const loadUserProfile = async () => {
    try {
        // Сначала проверяем сохраненное имя в userStorage
        const storedUserId = userStorage.getCurrentUserId();
        let storedName = null;
        
        if (storedUserId) {
            storedName = userStorage.getUserName(storedUserId);
            if (storedName && storedName !== 'Пользователь' && storedName !== 'undefined') {
                console.log('Имя из userStorage:', storedName);
                setCurrentUserName(storedName);
                setCurrentUserData(prev => ({ ...prev, name: storedName, displayName: storedName }));
                return; // Если имя уже есть, не делаем запрос
            }
        }
        
        // Если нет сохраненного имени, пробуем получить с бэка
        const profile = await fetchUserProfile();
        console.log('Профиль с бэка:', profile);
        
        let userName = profile.name || profile.display_name || profile.username;
        
        // Если имя пришло как undefined или 'undefined', игнорируем
        if (userName && userName !== 'undefined' && userName !== 'Пользователь') {
            setCurrentUserName(userName);
            setCurrentUserData(prev => ({ ...prev, name: userName, displayName: userName }));
            
            // Сохраняем в userStorage
            const userId = profile.id || storedUserId;
            if (userId) {
                userStorage.setCurrentUserId(userId.toString());
                userStorage.setUserName(userId.toString(), userName);
                if (profile.email) userStorage.setUserEmail(userId.toString(), profile.email);
                if (profile.role) userStorage.setUserRole(userId.toString(), profile.role);
            }
        } else {
            // Если имя не получено, используем заглушку для супервайзера
            const role = profile.role || 'supervisor';
            const defaultName = role === 'supervisor' ? 'Супервайзер' : 'Пользователь';
            setCurrentUserName(defaultName);
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        // Последняя попытка - взять имя из токена
        const token = localStorage.getItem('access_token');
        if (token) {
            const tokenData = parseJwt(token);
            if (tokenData) {
                let userName = tokenData.name || tokenData.username;
                if (!userName && tokenData.email) {
                    userName = tokenData.email.split('@')[0];
                }
                if (userName && userName !== 'undefined') {
                    setCurrentUserName(userName);
                } else {
                    setCurrentUserName('Супервайзер');
                }
            } else {
                setCurrentUserName('Супервайзер');
            }
        } else {
            setCurrentUserName('Супервайзер');
        }
    }
};

  // Загрузка данных при монтировании
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Слушаем обновления данных пользователя
  useEffect(() => {
    const handleUserDataUpdate = (event) => {
      console.log('Получено событие обновления:', event.detail);
      const { userId, name } = event.detail || {};
      
      if (name) {
        setCurrentUserName(name);
        setCurrentUserData(prev => ({ ...prev, name: name, displayName: name }));
      } else if (userId) {
        const updatedName = userStorage.getUserName(userId);
        if (updatedName && updatedName !== 'Пользователь') {
          setCurrentUserName(updatedName);
          setCurrentUserData(prev => ({ ...prev, name: updatedName, displayName: updatedName }));
        } else {
          loadUserProfile();
        }
      }
    };
    
    window.addEventListener('userDataUpdate', handleUserDataUpdate);
    return () => window.removeEventListener('userDataUpdate', handleUserDataUpdate);
  }, []);

  // Загрузка списка операторов и ПВЗ
  const loadOperatorsAndPvz = async () => {
    setLoadingOperators(true);
    setError('');
    try {
      const [operators, pvz] = await Promise.all([
        getOperatorsList(),
        getPvzList()
      ]);
      setOperatorsList(operators);
      setPvzList(pvz);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      if (error.message === 'Не авторизован' || error.message.includes('сессия истекла')) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 2000);
      } else {
        setError('Не удалось загрузить список операторов: ' + error.message);
      }
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
    const userId = userStorage.getCurrentUserId();
    if (userId) {
      userStorage.updateUserData(userId, updatedData);
      if (updatedData.name || updatedData.displayName) {
        const newName = updatedData.name || updatedData.displayName;
        setCurrentUserName(newName);
        console.log('Имя обновлено на:', newName);
      }
    }
    setCurrentUserData(prev => ({ ...prev, ...updatedData }));
    if (onUserUpdate) {
      onUserUpdate(updatedData);
    }
  };

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

  const displayName = currentUserName || 'Супервайзер';

  return (
    <div className="supervisor-page">
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

      <RedirectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRedirectConfirm}
        deliveriesList={deliveriesList}
        orderId={selectedOrderId}
      />

      <ReassignOperatorModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onConfirm={handleReassignOperator}
        operators={operatorsList}
        pvzList={pvzList}
        isLoading={loadingOperators}
      />

      {isProfileModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="profile-modal-close" 
              onClick={() => setIsProfileModalOpen(false)}
            >
              ×
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