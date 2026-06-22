import api from './api';

export const storeService = {
  getMyStores: () =>
    api.get('/stores').then(r => r.data),

  createStore: (data) =>
    api.post('/stores', data).then(r => r.data),

  updateStore: (id, data) =>
    api.put(`/stores/${id}`, data).then(r => r.data),

  deleteStore: (id) =>
    api.delete(`/stores/${id}`).then(r => r.data),

  getProducts: (storeId) =>
    api.get(`/stores/${storeId}/products`).then(r => r.data),

  addProduct: (storeId, data) =>
    api.post(`/stores/${storeId}/products`, data).then(r => r.data),

  updateProduct: (storeId, productId, data) =>
    api.put(`/stores/${storeId}/products/${productId}`, data).then(r => r.data),

  deleteProduct: (storeId, productId) =>
    api.delete(`/stores/${storeId}/products/${productId}`).then(r => r.data),
};