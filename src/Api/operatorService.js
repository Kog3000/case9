// src/Api/operatorService.js
const API_BASE_URL = 'https://pvz-backend.onrender.com';

const getToken = () => localStorage.getItem('access_token');

export async function changeOperatorPvz(operatorId, newPvzId) {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/supervisor/change_pvz_for_operator/${operatorId}?new_pvz_id=${newPvzId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
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
        
        return response.json();
    } catch (error) {
        console.error('Change operator PVZ error:', error);
        throw error;
    }
}

export async function getOperatorsList(pvzId = null) {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        let url = `${API_BASE_URL}/users/operators`;
        if (pvzId) {
            url += `?pvz_id=${pvzId}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка получения списка операторов');
        }
        
        return response.json();
    } catch (error) {
        console.error('Get operators error:', error);
        throw error;
    }
}

export async function getPvzList() {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/pvz/list`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка получения списка ПВЗ');
        }
        
        return response.json();
    } catch (error) {
        console.error('Get PVZ list error:', error);
        throw error;
    }
}