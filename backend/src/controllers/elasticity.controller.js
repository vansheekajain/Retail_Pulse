const elasticityService = require('../services/elasticity.service');
const { Store, Product } = require('../models');

exports.getPriceElasticity = async (req, res, next) => {
  try {
    const { storeId, productId } = req.query;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const result = await elasticityService.getPriceElasticity(storeId, productId);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Need at least')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.getCompetitorImpact = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const { competitors } = req.body;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    if (!store.lat || !store.lng) {
      return res.status(400).json({
        error: 'Store location not set. Please update store with lat/lng coordinates.',
      });
    }

    const result = await elasticityService.getCompetitorImpact(
      { lat: store.lat, lng: store.lng },
      competitors
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};