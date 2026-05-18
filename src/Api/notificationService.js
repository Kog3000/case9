// src/Api/notificationService.js

const API_BASE_URL = 'https://pvz-backend.onrender.com';

const getToken = () => localStorage.getItem('access_token');

const problemTypeMap = {
    technical: 1,
    order: 2,
    client: 3,
    equipment: 4,
    other: 5
};

const priorityMap = {
    high: 1,
    medium: 2,
    low: 3
};

export async function createOperatorNotification({ problemType, priority, description }) {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const type_problem = problemTypeMap[problemType];
    const priorityValue = priorityMap[priority];

    if (!type_problem) {
        throw new Error('Некорректный тип проблемы');
    }

    if (!priorityValue) {
        throw new Error('Некорректный приоритет');
    }

    if (!description || description.trim().length < 3) {
        throw new Error('Описание должно быть минимум 3 символа');
    }

    const response = await fetch(`${API_BASE_URL}/operator/create_notification`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type_problem,
            priority: priorityValue,
            message: description.trim()
        })
    });

    if (!response.ok) {
        let errorMessage = `Ошибка отправки заявки: HTTP ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch {
            // если backend не вернул JSON
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}

export async function fetchSupervisorNotifications() {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const response = await fetch(`${API_BASE_URL}/supervisor/all_notifications`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        let errorMessage = `Ошибка загрузки уведомлений: HTTP ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch {
            // если backend не вернул JSON
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}

export async function changeNotificationStatus(notificationId, problemSolution) {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const response = await fetch(
        `${API_BASE_URL}/supervisor/change_status_notification/${notificationId}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                problem_solution: problemSolution
            })
        }
    );

    if (!response.ok) {
        let errorMessage = `Ошибка изменения статуса уведомления: HTTP ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch {
            // если backend не вернул JSON
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}

// Получить ВСЕ заявки оператора (без фильтрации по статусу)
export async function fetchOperatorAllNotifications() {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const response = await fetch(`${API_BASE_URL}/operator/notifications`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        let errorMessage = `Ошибка загрузки уведомлений оператора: HTTP ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch {
            // если backend не вернул JSON
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}

// Получить завершенные заявки оператора (оставляем для обратной совместимости)
export async function fetchOperatorCompletedNotifications() {
    const token = getToken();

    if (!token) {
        throw new Error('Не авторизован');
    }

    const response = await fetch(
        `${API_BASE_URL}/operator/notifications?status_notification=completed`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        let errorMessage = `Ошибка загрузки уведомлений оператора: HTTP ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch {
            // если backend не вернул JSON
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}