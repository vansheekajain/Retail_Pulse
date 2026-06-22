import api from './api';

export const supplierService = {
  getSuppliers: (storeId) =>
    api.get('/suppliers', { params: { storeId } }).then(r => r.data),

  createSupplier: (data) =>
    api.post('/suppliers', data).then(r => r.data),

  updateSupplier: (id, data) =>
    api.put(`/suppliers/${id}`, data).then(r => r.data),

  deleteSupplier: (id) =>
    api.delete(`/suppliers/${id}`).then(r => r.data),

  getPOs: (storeId) =>
    api.get('/suppliers/po', { params: { storeId } }).then(r => r.data),

  createPO: (data) =>
    api.post('/suppliers/po', data).then(r => r.data),

  updatePOStatus: (id, status) =>
    api.put(`/suppliers/po/${id}`, { status }).then(r => r.data),
};