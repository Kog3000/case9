// src/Api/userService.js

const API_BASE_URL = 'https://pvz-backend.onrender.com';

const getToken = () => localStorage.getItem('access_token');

async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Ошибка ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Не удалось подключиться к серверу');
    }
}

export async function getCurrentUser() {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка получения данных пользователя');
        }
        
        const userData = await response.json();
        
        // Выводим в консоль для отладки
        console.log('User data from backend:', userData);
        
        return userData;
    } catch (error) {
        console.error('Get current user error:', error);
        throw error;
    }
}

export async function updateUserName(newName) {
    if (!newName || newName.length < 2) {
        throw new Error('Имя должно содержать минимум 2 символа');
    }
    
    return apiRequest(`/users/update_name?new_name=${encodeURIComponent(newName)}`, {
        method: 'PATCH'
    });
}

export async function updateUserEmail(newEmail) {
    if (!newEmail || !newEmail.includes('@')) {
        throw new Error('Введите корректный email');
    }
    
    return apiRequest(`/users/update_email?new_email=${encodeURIComponent(newEmail)}`, {
        method: 'PATCH'
    });
}

export async function updateUserAvatar(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/update_avatar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при загрузке аватара');
        }
        
        return response.json();
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw new Error('Не удалось загрузить аватар');
    }
}