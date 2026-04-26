import { useState, useEffect } from 'react';
import Filters from './Filters/Filters';
import OrdersSection from './Orders/OrdersSection';
import SupportTicket from '../../src/SupportTicket';
import ProfilePage from '../ProfilePage/ProfilePage';
import { userStorage } from '../Api/userStorageService.js';
import './OperatorPage.css'

export default function OperatorPage({ userData, onLogout, onUserUpdate }) {
    const [filters, setFilters] = useState({ created_date: null, status_order: null });
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(userData);

    // Загрузка сохраненных данных оператора
    useEffect(() => {
        const loadOperatorData = async () => {
            const userId = userStorage.getCurrentUserId();
            if (userId) {
                const savedData = userStorage.getUserData(userId);
                if (savedData) {
                    setCurrentUserData(prev => ({ ...prev, ...savedData }));
                }
            }
        };
        loadOperatorData();
    }, []);

    // Обновление данных при изменении userData из пропсов
    useEffect(() => {
        if (userData) {
            setCurrentUserData(prev => ({ ...prev, ...userData }));
        }
    }, [userData]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleTicketSubmit = (ticket) => {
        console.log('Заявка отправлена:', ticket);
        // Здесь можно добавить отправку на сервер
        // Или уведомление супервизору
    };

    const handleUserUpdate = (updatedData) => {
        const userId = userStorage.getCurrentUserId();
        if (userId) {
            userStorage.updateUserData(userId, updatedData);
        }
        setCurrentUserData(prev => ({ ...prev, ...updatedData }));
        if (onUserUpdate) {
            onUserUpdate(updatedData);
        }
    };

    const handleProfileLogout = () => {
        setIsProfileModalOpen(false);
        if (onLogout) {
            onLogout();
        }
    };

    const handleOpenProfile = () => {
        setIsProfileModalOpen(true);
    };

    return (
        <>
            <div className='content-wrapper'>
                <div className='filters-section'>
                    <Filters onFilterChange={handleFilterChange} />
                </div>
                <div className='orders-section'>
                    <OrdersSection filters={filters} />
                </div>
                <div className='support-section'>
                    <SupportTicket userData={currentUserData} onSubmit={handleTicketSubmit} />
                </div>
            </div>

            {/* Кнопка для открытия профиля (если нет хедера) */}
            <button onClick={handleOpenProfile} className="profile-button">
                Профиль
            </button>

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
        </>
    );
}