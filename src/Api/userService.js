// src/Api/userService.js

export const API_BASE_URL = 'https://pvz-backend.onrender.com';
const REQUEST_TIMEOUT = 8000;

const getToken = () => localStorage.getItem('access_token');

export const STORAGE_KEYS = {
    USER_ID: 'app_user_id',
    USER_NAME: 'app_user_name',
    USER_EMAIL: 'app_user_email',
    USER_ROLE: 'app_user_role',
    USER_AVATAR: 'app_user_avatar',
    USER_DISPLAY_NAME: 'app_user_display_name'
};

export function getFullImageUrl(url) {
    if (!url) return null;

    // base64 превью оставляем как есть
    if (typeof url === 'string' && url.startsWith('data:image')) {
        return url;
    }

    // абсолютные ссылки оставляем как есть
    if (
        typeof url === 'string' &&
        (url.startsWith('http://') || url.startsWith('https://'))
    ) {
        return url;
    }

    // относительный путь backend-а
    if (typeof url === 'string' && url.startsWith('/')) {
        return `${API_BASE_URL}${url}`;
    }

    return `${API_BASE_URL}/${url}`;
}

export function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function saveUserToLocalStorage(userId, name, email, role, avatarUrl) {
    if (userId !== null && userId !== undefined) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, String(userId));
    }

    if (name) {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        localStorage.setItem(STORAGE_KEYS.USER_DISPLAY_NAME, name);
    }

    if (email) {
        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
    }

    if (role) {
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    }

    if (avatarUrl) {
        localStorage.setItem(STORAGE_KEYS.USER_AVATAR, getFullImageUrl(avatarUrl));
    }
}

function clearUserFromLocalStorage() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

function updateStoredUserObject(updates) {
    const userStr = localStorage.getItem('user');

    if (!userStr) return;

    try {
        const userObj = JSON.parse(userStr);

        const normalizedUpdates = { ...updates };

        if (normalizedUpdates.image_url) {
            normalizedUpdates.image_url = getFullImageUrl(normalizedUpdates.image_url);
        }

        localStorage.setItem(
            'user',
            JSON.stringify({
                ...userObj,
                ...normalizedUpdates
            })
        );
    } catch {
        // некорректный JSON в localStorage — просто игнорируем
    }
}

async function requestWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

export async function fetchUserProfile() {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    let storedUser = null;
    const userStr = localStorage.getItem('user');

    if (userStr) {
        try {
            storedUser = JSON.parse(userStr);
        } catch {
            storedUser = null;
        }
    }

    const tokenData = parseJwt(token);

    if (!tokenData && !storedUser) {
        throw new Error('Не удалось получить данные пользователя');
    }

    const userId =
        storedUser?.id ||
        storedUser?.user_id ||
        tokenData?.id ||
        tokenData?.user_id ||
        tokenData?.sub ||
        localStorage.getItem(STORAGE_KEYS.USER_ID);

    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);

    let userName = null;

    if (savedName && savedName !== 'Пользователь' && savedName !== 'undefined') {
        userName = savedName;
    } else if (storedUser?.name && storedUser.name !== 'Пользователь') {
        userName = storedUser.name;
    } else if (storedUser?.display_name) {
        userName = storedUser.display_name;
    } else if (storedUser?.username) {
        userName = storedUser.username;
    } else if (storedUser?.email) {
        userName = storedUser.email.split('@')[0];
    } else if (tokenData?.name) {
        userName = tokenData.name;
    } else if (tokenData?.email) {
        userName = tokenData.email.split('@')[0];
    } else if (tokenData?.sub && String(tokenData.sub).includes('@')) {
        userName = String(tokenData.sub).split('@')[0];
    } else {
        userName = tokenData?.role === 'supervisor' ? 'Супервайзер' : 'Пользователь';
    }

    const userEmail =
        storedUser?.email ||
        tokenData?.email ||
        (tokenData?.sub && String(tokenData.sub).includes('@') ? tokenData.sub : null) ||
        localStorage.getItem(STORAGE_KEYS.USER_EMAIL);

    const userRole =
        storedUser?.role ||
        tokenData?.role ||
        localStorage.getItem(STORAGE_KEYS.USER_ROLE);

    const rawAvatar =
        storedUser?.image_url ||
        storedUser?.avatar ||
        storedUser?.url ||
        localStorage.getItem(STORAGE_KEYS.USER_AVATAR) ||
        null;

    const userAvatar = getFullImageUrl(rawAvatar);

    if (userId) {
        saveUserToLocalStorage(userId, userName, userEmail, userRole, userAvatar);

        updateStoredUserObject({
            id: userId,
            name: userName,
            email: userEmail,
            role: userRole,
            image_url: userAvatar
        });
    }

    return {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        image_url: userAvatar,
        pvz: storedUser?.pvz || null
    };
}

export function getCurrentUserSync() {
    const token = getToken();

    if (!token) {
        return null;
    }

    const tokenData = parseJwt(token);

    if (!tokenData) {
        return null;
    }

    let storedUser = null;
    const userStr = localStorage.getItem('user');

    if (userStr) {
        try {
            storedUser = JSON.parse(userStr);
        } catch {
            storedUser = null;
        }
    }

    const localName = localStorage.getItem(STORAGE_KEYS.USER_NAME);

    let userName =
        localName ||
        storedUser?.name ||
        tokenData.name;

    if (!userName && storedUser?.email) {
        userName = storedUser.email.split('@')[0];
    }

    if (!userName && tokenData.email) {
        userName = tokenData.email.split('@')[0];
    }

    if (!userName && tokenData.sub && String(tokenData.sub).includes('@')) {
        userName = String(tokenData.sub).split('@')[0];
    }

    if (!userName) {
        userName = tokenData.role === 'supervisor' ? 'Супервайзер' : 'Пользователь';
    }

    const rawAvatar =
        localStorage.getItem(STORAGE_KEYS.USER_AVATAR) ||
        storedUser?.image_url ||
        storedUser?.avatar ||
        tokenData.image_url ||
        null;

    return {
        id: storedUser?.id || tokenData.id || tokenData.sub,
        email:
            storedUser?.email ||
            tokenData.email ||
            (tokenData.sub && String(tokenData.sub).includes('@') ? tokenData.sub : null),
        role: storedUser?.role || tokenData.role,
        name: userName,
        image_url: getFullImageUrl(rawAvatar),
        pvz: storedUser?.pvz || null
    };
}

export async function updateUserName(newName) {
    if (!newName || newName.length < 3) {
        throw new Error('Имя должно быть от 3 до 50 символов');
    }

    if (newName.length > 50) {
        throw new Error('Имя должно быть от 3 до 50 символов');
    }

    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const url = `${API_BASE_URL}/users/update_name?new_name=${encodeURIComponent(newName)}`;
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    // Оптимистичное локальное обновление
    if (userId) {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, newName);
        localStorage.setItem(STORAGE_KEYS.USER_DISPLAY_NAME, newName);
        updateStoredUserObject({ name: newName });

        window.dispatchEvent(
            new CustomEvent('userDataUpdate', {
                detail: {
                    userId,
                    name: newName
                }
            })
        );
    }

    try {
        const response = await requestWithTimeout(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const userSchema = await response.json();

        if (userSchema.name) {
            localStorage.setItem(STORAGE_KEYS.USER_NAME, userSchema.name);
            localStorage.setItem(STORAGE_KEYS.USER_DISPLAY_NAME, userSchema.name);

            updateStoredUserObject({
                name: userSchema.name
            });

            window.dispatchEvent(
                new CustomEvent('userDataUpdate', {
                    detail: {
                        userId,
                        name: userSchema.name
                    }
                })
            );
        }

        if (userSchema.image_url) {
            const normalizedAvatar = getFullImageUrl(userSchema.image_url);
            userSchema.image_url = normalizedAvatar;

            localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedAvatar);

            updateStoredUserObject({
                image_url: normalizedAvatar
            });
        }

        return userSchema;
    } catch {
        return {
            id: userId ? Number(userId) : null,
            name: newName,
            message: 'Имя сохранено локально'
        };
    }
}

export async function updateUserAvatar(file) {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    if (!file) {
        throw new Error('Файл не выбран');
    }

    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/users/update_image`;

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    const rawImageUrl = result.image_url || result.avatar || result.url;
    const imageUrl = getFullImageUrl(rawImageUrl);

    if (!imageUrl) {
        throw new Error('Сервер не вернул URL аватара');
    }

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (userId) {
        localStorage.setItem(STORAGE_KEYS.USER_AVATAR, imageUrl);

        updateStoredUserObject({
            image_url: imageUrl
        });

        window.dispatchEvent(
            new CustomEvent('userAvatarUpdate', {
                detail: {
                    userId,
                    image_url: imageUrl
                }
            })
        );

        window.dispatchEvent(
            new CustomEvent('userDataUpdate', {
                detail: {
                    userId,
                    avatar: imageUrl,
                    image_url: imageUrl
                }
            })
        );
    }

    return {
        ...result,
        image_url: imageUrl
    };
}

export async function deleteUserAvatar() {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const defaultAvatar = getFullImageUrl('/media/default_avatar.webp');
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    // Оптимистично сбрасываем локально
    if (userId) {
        localStorage.setItem(STORAGE_KEYS.USER_AVATAR, defaultAvatar);

        updateStoredUserObject({
            image_url: defaultAvatar
        });

        window.dispatchEvent(
            new CustomEvent('userAvatarUpdate', {
                detail: {
                    userId,
                    image_url: defaultAvatar
                }
            })
        );

        window.dispatchEvent(
            new CustomEvent('userDataUpdate', {
                detail: {
                    userId,
                    avatar: defaultAvatar,
                    image_url: defaultAvatar
                }
            })
        );
    }

    const url = `${API_BASE_URL}/users/delete_image`;

    try {
        const response = await requestWithTimeout(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        const newUrl = getFullImageUrl(result.image_url || result.avatar || defaultAvatar);

        if (userId && newUrl) {
            localStorage.setItem(STORAGE_KEYS.USER_AVATAR, newUrl);

            updateStoredUserObject({
                image_url: newUrl
            });

            window.dispatchEvent(
                new CustomEvent('userAvatarUpdate', {
                    detail: {
                        userId,
                        image_url: newUrl
                    }
                })
            );

            window.dispatchEvent(
                new CustomEvent('userDataUpdate', {
                    detail: {
                        userId,
                        avatar: newUrl,
                        image_url: newUrl
                    }
                })
            );
        }

        return {
            ...result,
            image_url: newUrl
        };
    } catch {
        return {
            message: 'Аватар сброшен локально',
            image_url: defaultAvatar
        };
    }
}

export function clearAllUserData() {
    clearUserFromLocalStorage();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
}

export async function updateUserEmail() {
    throw new Error('Эндпоинт update_email не реализован');
}

export async function checkServerConnection() {
    try {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/users/update_name?new_name=test`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.status !== 404;
    } catch {
        return false;
    }
}

export async function getCurrentUser() {
    const user = getCurrentUserSync();

    if (!user) {
        throw new Error('Не удалось получить данные пользователя');
    }

    return user;
}