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

// Получить список позиций заказов с фильтрацией по дате и статусу
export const getDeliveries = async (createdDate = null, statusOrder = null) => {
  const params = {};
  if (createdDate) params.created_date = createdDate;
  if (statusOrder) params.status_order = statusOrder;

  const response = await api.get('/operator/delivery_items', { params });
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

// Получение списка pending заказов для супервайзера (по ПВЗ и дате)
export const getSupervisorDeliveries = async (pvzId, createdDate) => {
  const response = await api.get(`/supervisor/delivery_items/${pvzId}`, {
    params: { created_date: createdDate }
  });
  return response.data;
};

// Перенаправление заказа в другую доставку (ПВЗ)
export const changeDelivery = async (deliveryItemId, newDeliveryId) => {
  const response = await api.put(`/supervisor/change_delivery/${deliveryItemId}`, null, {
    params: { new_delivery_id: newDeliveryId }
  });
  return response.data;
};

// Получить список доступных доставок для перенаправления (на ту же дату, исключая текущую)
export const getDeliveriesForRedirect = async (deliveryItemId) => {
  const response = await api.get(`/supervisor/deliveries_for_redirect/${deliveryItemId}`);
  return response.data;
};