const mlService = require('../services/ml.service');
const { Store, Product } = require('../models');

exports.getMLForecast = async (req, res, next) => {
  try {
    const { storeId, productId, days = 7 } = req.query;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const product = await Product.findOne({ where: { id: productId, storeId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const result = await mlService.getMLForecast(storeId, productId, parseInt(days));
    res.json(result);
  } catch (err) {
    if (err.message.includes('Need at least')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.getAllMLForecasts = async (req, res, next) => {
  try {
    const { storeId, days = 7 } = req.query;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const products = await Product.findAll({
      where: { storeId, isActive: true },
    });

    const results = [];
    for (const product of products) {
      try {
        const forecast = await mlService.getMLForecast(storeId, product.id, parseInt(days));
        results.push(forecast);
      } catch {
        // Skip products with insufficient data
      }
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};