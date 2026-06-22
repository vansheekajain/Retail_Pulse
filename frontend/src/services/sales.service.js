import api from './api';

export const salesService = {
  createSale: (storeId, data) =>
    api.post('/sales', { ...data, storeId }).then(r => r.data),

  getSales: (storeId, params = {}) =>
    api.get('/sales', { params: { storeId, ...params } }).then(r => r.data),

  getDailySummary: (storeId, date) =>
    api.get('/sales/summary', { params: { storeId, date } }).then(r => r.data),

  updateSale: (storeId, id, data) =>
    api.put(`/sales/${id}`, { ...data, storeId }).then(r => r.data),

  deleteSale: (storeId, id) =>
    api.delete(`/sales/${id}`, { params: { storeId } }).then(r => r.data),
};