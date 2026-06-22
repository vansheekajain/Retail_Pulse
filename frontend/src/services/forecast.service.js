import api from './api';

export const forecastService = {
  getAllForecasts: (storeId, days = 7) =>
    api.get('/forecast', { params: { storeId, days } }).then(r => r.data),

  getForecast: (storeId, productId, days = 7) =>
    api.get('/forecast/one', { params: { storeId, productId, days } }).then(r => r.data),
};