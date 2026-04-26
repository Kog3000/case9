// src/Api/userService.js

const API_BASE_URL = 'https://pvz-backend.onrender.com';
import { userStorage } from './userStorageService.js';

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
        throw error;
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
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Ошибка получения данных пользователя');
        }
        
        const userData = await response.json();
        
        // Сохраняем ID пользователя для разделения данных
        if (userData.id) {
            userStorage.setCurrentUserId(userData.id.toString());
            userStorage.setUserData(userData.id.toString(), {
                name: userData.name || userData.display_name,
                email: userData.email,
                avatar: userData.avatar,
                role: userData.role
            });
        }
        
        return userData;
    } catch (error) {
        console.error('Get current user error:', error);
        throw error;
    }
}

export async function updateUserName(newName) {
    if (!newName || newName.length < 3) {
        throw new Error('Имя должно содержать минимум 3 символа');
    }
    
    if (newName.length > 50) {
        throw new Error('Имя не должно превышать 50 символов');
    }
    
    const token = getToken();
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/update_name?new_name=${encodeURIComponent(newName)}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Ошибка ${response.status}: не удалось обновить имя`);
        }
        
        const updatedUser = await response.json();
        
        // Обновляем данные в userStorage
        const userId = updatedUser.id || userStorage.getCurrentUserId();
        if (userId) {
            userStorage.setUserName(userId, newName);
        }
        
        // Для обратной совместимости
        localStorage.setItem('userName', newName);
        localStorage.setItem('userDisplayName', newName);
        
        return updatedUser;
    } catch (error) {
        console.error('Update name error:', error);
        throw error;
    }
}

export async function updateUserEmail(newEmail) {
    if (!newEmail || !newEmail.includes('@')) {
        throw new Error('Введите корректный email');
    }
    
    const token = getToken();
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/update_email?new_email=${encodeURIComponent(newEmail)}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при обновлении email');
        }
        
        const updatedUser = await response.json();
        
        // Обновляем данные в userStorage
        const userId = updatedUser.id || userStorage.getCurrentUserId();
        if (userId) {
            userStorage.setUserEmail(userId, newEmail);
        }
        
        localStorage.setItem('userEmail', newEmail);
        
        return updatedUser;
    } catch (error) {
        console.error('Update email error:', error);
        throw error;
    }
}

export async function updateUserAvatar(file) {
    const token = getToken();
    if (!token) {
        throw new Error('Не авторизован');
    }
    
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
        
        const updatedUser = await response.json();
        
        // Обновляем данные в userStorage
        const userId = updatedUser.id || userStorage.getCurrentUserId();
        if (userId && updatedUser.avatar) {
            userStorage.setUserAvatar(userId, updatedUser.avatar);
        }
        
        if (updatedUser.avatar) {
            localStorage.setItem('userAvatar', updatedUser.avatar);
        }
        
        return updatedUser;
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw new Error('Не удалось загрузить аватар');
    }
}

export async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        return response.ok;
    } catch (error) {
        console.error('Server connection failed:', error);
        return false;
    }
}

export function clearAllUserData() {
    const userId = userStorage.getCurrentUserId();
    if (userId) {
        userStorage.clearUserData(userId);
    }
    userStorage.setCurrentUserId(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
}