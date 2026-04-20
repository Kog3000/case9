// src/Api/statistics.js
import api from './axios';

export const getDailyLoad = async (pvzId, date) => {
  try {
    const response = await api.get(`/supervisor/statistics/one_day/${pvzId}`, {
      params: { date: date },
      timeout: 10000, // 10 секунд таймаут
    });
    
    // Проверяем, что ответ содержит данные
    if (!response.data) {
      throw new Error('Нет данных');
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    
    // Обработка разных типов ошибок
    if (error.code === 'ECONNABORTED') {
      throw new Error('Сервер не отвечает. Попробуйте позже.');
    }
    
    if (error.message === 'Network Error') {
      // Если сервер упал или перезагрузился
      throw new Error('Сервер временно недоступен. Пожалуйста, подождите и попробуйте снова.');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Нет данных для ПВЗ ${pvzId} за ${date}`);
    }
    
    if (error.response?.status === 500) {
      throw new Error('Ошибка на сервере. Попробуйте другую дату.');
    }
    
    // Если сервер не ответил вообще
    if (!error.response) {
      throw new Error('Сервер не отвечает. Проверьте соединение или попробуйте позже.');
    }
    
    throw new Error('Не удалось загрузить данные. Попробуйте другую дату.');
  }
};