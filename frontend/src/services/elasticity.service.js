import api from './api';

export const elasticityService = {
  getPriceElasticity: (storeId, productId) =>
    api.get('/elasticity/price', { params: { storeId, productId } }).then(r => r.data),

  getCompetitorImpact: (storeId, competitors) =>
    api.post('/elasticity/competitor', { competitors }, { params: { storeId } }).then(r => r.data),
};