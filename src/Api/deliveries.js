//api/deliveries.js
import api from './axios';

// Принять на ПВЗ
export const receiveItem = async (deliveryItemId, receivingTime) => {
  const response = await api.put(
    `operator/received_delivery_item/${deliveryItemId}`,
    {},
    { params: { receiving_time: receivingTime } }
  );
  return response.data;
};

// Получить список доставок
export const getDeliveries = async () => {
  const response = await api.get('/operator/delivery_demo');
  return response.data;
};

// Выдать клиенту или вернуть на склад (или любая смена статуса)
export const updateOrderStatus = async (deliveryItemId, status, time) => {
  const response = await api.put(
    `operator/status/${deliveryItemId}`,
    {}, // тело запроса пустое
    {
      params: {
        change_status: status,
        operation_time: time
      }
    }
  );
  return response.data;
};