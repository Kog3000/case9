// src/Api/userStorageService.js

class UserStorageService {
    constructor() {
        this.currentUserKey = 'current_user_id';
        this.userDataPrefix = 'user_data_';
    }

    getCurrentUserId() {
        return localStorage.getItem(this.currentUserKey);
    }

    setCurrentUserId(userId) {
        if (userId) {
            localStorage.setItem(this.currentUserKey, userId);
        } else {
            localStorage.removeItem(this.currentUserKey);
        }
    }

    getUserStorageKey(userId) {
        return `${this.userDataPrefix}${userId}`;
    }

    getUserData(userId) {
        const key = this.getUserStorageKey(userId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    setUserData(userId, data) {
        const key = this.getUserStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(data));
    }

    updateUserData(userId, updates) {
        const currentData = this.getUserData(userId) || {};
        const newData = { ...currentData, ...updates };
        this.setUserData(userId, newData);
        return newData;
    }

    clearUserData(userId) {
        const key = this.getUserStorageKey(userId);
        localStorage.removeItem(key);
    }

    getCurrentUserData() {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        return this.getUserData(userId);
    }

    updateCurrentUserData(updates) {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        return this.updateUserData(userId, updates);
    }

    clearCurrentUserData() {
        const userId = this.getCurrentUserId();
        if (userId) {
            this.clearUserData(userId);
        }
        this.setCurrentUserId(null);
    }

    getUserName(userId) {
        const data = this.getUserData(userId);
        return data?.name || null;
    }

    getUserEmail(userId) {
        const data = this.getUserData(userId);
        return data?.email || null;
    }

    getUserAvatar(userId) {
        const data = this.getUserData(userId);
        return data?.avatar || null;
    }

    getUserRole(userId) {
        const data = this.getUserData(userId);
        return data?.role || null;
    }

    setUserName(userId, name) {
        return this.updateUserData(userId, { name, displayName: name });
    }

    setUserEmail(userId, email) {
        return this.updateUserData(userId, { email });
    }

    setUserAvatar(userId, avatar) {
        return this.updateUserData(userId, { avatar });
    }

    setUserRole(userId, role) {
        return this.updateUserData(userId, { role });
    }
}

export const userStorage = new UserStorageService();