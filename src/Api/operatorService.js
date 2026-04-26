// src/Api/operatorService.js
const API_BASE_URL = 'https://pvz-backend.onrender.com';
import { parseJwt } from './userService.js';

const getToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// Функция для обновления токена
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('Нет refresh токена');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить токен');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        return data.access_token;
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_user');
        throw error;
    }
}

// Функция-обертка для запросов с автоматическим обновлением токена
async function fetchWithAuth(url, options = {}) {
    let token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }

    const makeRequest = async (currentToken) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            try {
                const newToken = await refreshAccessToken();
                const retryResponse = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                return retryResponse;
            } catch (refreshError) {
                window.location.href = '/login';
                throw new Error('Сессия истекла, пожалуйста, войдите снова');
            }
        }

        return response;
    };

    return makeRequest(token);
}

export async function changeOperatorPvz(operatorId, newPvzId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/supervisor/change_pvz_for_operator/${operatorId}?new_pvz_id=${newPvzId}`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            if (response.status === 404) {
                throw new Error(error.detail || 'Оператор или ПВЗ не найден');
            }
            if (response.status === 409) {
                throw new Error(error.detail || 'Оператор уже закреплён за этим ПВЗ');
            }
            throw new Error(error.detail || `Ошибка ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Change operator PVZ error:', error);
        throw error;
    }
}

export async function getOperatorsList() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/supervisor/operators`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Ошибка ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data;
        }
        
        if (data.operators) return data.operators;
        if (data.items) return data.items;
        
        return [];
    } catch (error) {
        console.error('Get operators error:', error);
        if (error.message === 'Не авторизован' || error.message.includes('сессия истекла')) {
            window.location.href = '/login';
        }
        throw error;
    }
}

export async function getPvzList() {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        // Используем правильный эндпоинт /supervisor/all_pvz
        const response = await fetch(`${API_BASE_URL}/supervisor/all_pvz`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Ошибка ${response.status}`);
        }
        
        const data = await response.json();
        
        // Обрабатываем ответ от бэкенда
        let pvzList = [];
        
        if (Array.isArray(data)) {
            pvzList = data;
        } else if (data.pvz_list) {
            pvzList = data.pvz_list;
        } else if (data.points) {
            pvzList = data.points;
        } else if (data.items) {
            pvzList = data.items;
        } else if (data.data && Array.isArray(data.data)) {
            pvzList = data.data;
        }
        
        // Форматируем данные ПВЗ (приводим к единому формату)
        const formattedPvzList = pvzList.map(pvz => ({
            id: pvz.id,
            address: pvz.address,
            work_start: pvz.work_start || pvz.workStart || '09:00',
            work_end: pvz.work_end || pvz.workEnd || '21:00'
        }));
        
        if (formattedPvzList.length === 0) {
            console.warn('Список ПВЗ пуст');
        }
        
        return formattedPvzList;
        
    } catch (error) {
        console.error('Get PVZ list error:', error);
        
        // Если эндпоинт не работает, пробуем получить ПВЗ из списка операторов как запасной вариант
        try {
            console.log('Пробуем получить ПВЗ из списка операторов...');
            const operators = await getOperatorsList();
            const uniquePvz = new Map();
            
            operators.forEach(operator => {
                if (operator.pvz && operator.pvz.id && !uniquePvz.has(operator.pvz.id)) {
                    uniquePvz.set(operator.pvz.id, {
                        id: operator.pvz.id,
                        address: operator.pvz.address,
                        work_start: operator.pvz.work_start || '09:00',
                        work_end: operator.pvz.work_end || '21:00'
                    });
                }
            });
            
            const pvzList = Array.from(uniquePvz.values());
            if (pvzList.length > 0) {
                return pvzList;
            }
        } catch (fallbackError) {
            console.error('Fallback тоже не сработал:', fallbackError);
        }
        
        // Если ничего не сработало, выбрасываем ошибку
        throw error;
    }
}