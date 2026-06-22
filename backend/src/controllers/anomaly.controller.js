const anomalyService = require('../services/anomaly.service');
const { Store } = require('../models');

exports.getAnomalies = async (req, res, next) => {
  try {
    const { storeId, days = 30 } = req.query;

    const store = await Store.findOne({
      where: { id: storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const anomalies = await anomalyService.detectAnomalies(
      storeId, parseInt(days)
    );

    res.json({
      total: anomalies.length,
      anomalies,
    });
  } catch (err) {
    next(err);
  }
};























