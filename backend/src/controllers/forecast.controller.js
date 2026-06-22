const forecastService = require('../services/forecast.service');
const { Store, Product } = require('../models');

exports.getForecast = async (req, res, next) => {
  try {
    const { storeId, productId, days = 7 } = req.query;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const product = await Product.findOne({
      where: { id: productId, storeId },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Generate fresh forecast
    const forecasts = await forecastService.generateForecast(
      storeId, productId, parseInt(days)
    );

    res.json({
      product: { id: product.id, name: product.name, unit: product.unit },
      forecasts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllForecasts = async (req, res, next) => {
  try {
    const { storeId, days = 7 } = req.query;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const products = await Product.findAll({
      where: { storeId, isActive: true },
    });

    const results = await Promise.all(
      products.map(async (product) => {
        const forecasts = await forecastService.generateForecast(
          storeId, product.id, parseInt(days)
        );
        return {
          product: { id: product.id, name: product.name, unit: product.unit },
          forecasts,
        };
      })
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
};