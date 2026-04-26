// src/Api/userService.js

const API_BASE_URL = 'https://pvz-backend.onrender.com';
import { userStorage } from './userStorageService.js';

const getToken = () => localStorage.getItem('access_token');

// Функция для парсинга JWT токена
export function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Ошибка парсинга JWT:', error);
        return null;
    }
}

// Универсальная функция API запросов
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

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ПРОФИЛЕМ ПОЛЬЗОВАТЕЛЯ ==========

// Получение данных пользователя с бэка (без использования /users/me и без 403)
export async function fetchUserProfile() {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    // Получаем данные из токена как основу
    const tokenData = parseJwt(token);
    
    // Проверяем сохраненные данные в userStorage
    let userId = tokenData?.sub || tokenData?.user_id || tokenData?.id;
    let savedName = null;
    
    if (userId) {
        savedName = userStorage.getUserName(userId);
    }
    
    // Если нет userId из токена, берем из storage
    if (!userId) {
        userId = userStorage.getCurrentUserId();
        if (userId) {
            savedName = userStorage.getUserName(userId);
        }
    }
    
    let userName = null;
    
    // Если есть сохраненное имя и оно не "Пользователь" - используем его
    if (savedName && savedName !== 'Пользователь' && savedName !== 'undefined') {
        userName = savedName;
        console.log('Имя из userStorage:', userName);
    }
    
    // Если нет сохраненного имени, пробуем взять из токена
    if (!userName) {
        userName = tokenData?.name || tokenData?.username;
        if (!userName && tokenData?.email) {
            userName = tokenData.email.split('@')[0];
        }
        if (!userName) {
            // Определяем роль из токена
            const role = tokenData?.role || tokenData?.user_role;
            userName = role === 'supervisor' ? 'Супервайзер' : 'Пользователь';
        }
        console.log('Имя из токена:', userName);
    }
    
    // Сохраняем в userStorage для будущего использования
    if (userId && userName) {
        userStorage.setCurrentUserId(userId.toString());
        userStorage.setUserName(userId.toString(), userName);
        if (tokenData?.email) userStorage.setUserEmail(userId.toString(), tokenData.email);
        if (tokenData?.role) userStorage.setUserRole(userId.toString(), tokenData.role);
    }
    
    const userData = {
        id: userId,
        name: userName,
        email: tokenData?.email,
        role: tokenData?.role || tokenData?.user_role,
        display_name: userName
    };
    
    console.log('Финальные данные пользователя:', userData);
    return userData;
}

// Быстрое получение текущего пользователя из токена (без запросов к бэку)
export async function getCurrentUser() {
    const token = getToken();
    
    if (!token) {
        throw new Error('Не авторизован');
    }
    
    // Получаем данные из токена
    const tokenData = parseJwt(token);
    
    if (tokenData) {
        let userName = tokenData.name || tokenData.username;
        if (!userName && tokenData.email) {
            userName = tokenData.email.split('@')[0];
        }
        if (!userName) {
            const role = tokenData.role || tokenData.user_role;
            userName = role === 'supervisor' ? 'Супервайзер' : 'Пользователь';
        }
        
        const userData = {
            id: tokenData.sub || tokenData.user_id || tokenData.id,
            email: tokenData.email,
            role: tokenData.role || tokenData.user_role,
            name: userName,
            display_name: userName
        };
        
        if (userData.id) {
            userStorage.setCurrentUserId(userData.id.toString());
            const savedData = userStorage.getUserData(userData.id.toString());
            
            userStorage.setUserData(userData.id.toString(), {
                name: savedData?.name || userData.name,
                email: savedData?.email || userData.email,
                avatar: savedData?.avatar || null,
                role: userData.role
            });
        }
        
        return userData;
    }
    
    const userId = userStorage.getCurrentUserId();
    if (userId) {
        const savedData = userStorage.getUserData(userId);
        if (savedData && savedData.name) {
            return {
                id: parseInt(userId),
                ...savedData
            };
        }
    }
    
    throw new Error('Не удалось получить данные пользователя');
}

// Обновление имени пользователя
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
    
    // Пробуем существующие эндпоинты с бэка
    const endpoints = [
        `/users/update_name?new_name=${encodeURIComponent(newName)}`,
        `/supervisor/update_name?new_name=${encodeURIComponent(newName)}`,
        `/operator/update_name?new_name=${encodeURIComponent(newName)}`
    ];
    
    let lastError = null;
    let successResponse = null;
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                successResponse = await response.json();
                break;
            }
            
            if (response.status !== 404 && response.status !== 403) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `Ошибка ${response.status}`);
            }
        } catch (err) {
            lastError = err;
            continue;
        }
    }
    
    // Сохраняем имя в userStorage в любом случае
    const userId = userStorage.getCurrentUserId();
    if (userId) {
        userStorage.setUserName(userId, newName);
        localStorage.setItem('userName', newName);
        localStorage.setItem('userDisplayName', newName);
    }
    
    // Отправляем событие обновления
    window.dispatchEvent(new CustomEvent('userDataUpdate', { 
        detail: { userId: userId, name: newName }
    }));
    
    if (successResponse) {
        return successResponse;
    }
    
    console.warn('Серверный эндпоинт для обновления имени не найден, но имя сохранено локально');
    return { name: newName, id: userId ? parseInt(userId) : null, message: 'Имя сохранено локально' };
}

// Обновление email пользователя
export async function updateUserEmail(newEmail) {
    if (!newEmail || !newEmail.includes('@')) {
        throw new Error('Введите корректный email');
    }
    
    return apiRequest(`/users/update_email?new_email=${encodeURIComponent(newEmail)}`, {
        method: 'PATCH'
    });
}

// Обновление аватара пользователя
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
        
        const result = await response.json();
        
        // Сохраняем аватар в userStorage
        const userId = userStorage.getCurrentUserId();
        if (userId && result.avatar) {
            userStorage.setUserAvatar(userId, result.avatar);
            localStorage.setItem('userAvatar', result.avatar);
        }
        
        return result;
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw new Error('Не удалось загрузить аватар');
    }
}

// Проверка соединения с сервером
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

// Очистка всех данных пользователя
export function clearAllUserData() {
    const userId = userStorage.getCurrentUserId();
    if (userId) {
        userStorage.clearUserData(userId);
    }
    userStorage.setCurrentUserId(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userRole');
}