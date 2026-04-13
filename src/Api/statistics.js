// src/Api/statistics.js
import api from './axios';

export const getDailyLoad = async (pvzId, date) => {
  try {
    const response = await api.get(`/supervisor/statistics/one_day/${pvzId}`, {
      params: { date: date }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    throw error;
  }
};