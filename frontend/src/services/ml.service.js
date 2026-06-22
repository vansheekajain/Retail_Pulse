import api from './api';

export const mlService = {
  getMLForecast: (storeId, productId, days = 7) =>
    api.get('/ml/one', { params: { storeId, productId, days } }).then(r => r.data),

  getAllMLForecasts: (storeId, days = 7) =>
    api.get('/ml', { params: { storeId, days } }).then(r => r.data),
};