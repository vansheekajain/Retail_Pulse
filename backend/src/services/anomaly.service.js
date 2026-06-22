const { SaleEntry, Product } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

// Calculate mean and standard deviation
const calcStats = (values) => {
  if (values.length === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return { mean, std: Math.sqrt(variance) };
};

// Detect anomalies using Z-score method
exports.detectAnomalies = async (storeId, days = 30) => {
  const from = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
  const to   = dayjs().format('YYYY-MM-DD');

  const sales = await SaleEntry.findAll({
    where: {
      storeId,
      saleDate: { [Op.between]: [from, to] },
    },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'unit'],
    }],
    order: [['saleDate', 'ASC']],
  });

  // Group by product
  const byProduct = {};
  sales.forEach(s => {
    const pid = s.productId;
    if (!byProduct[pid]) byProduct[pid] = [];
    byProduct[pid].push({
      date:        s.saleDate,
      qty:         parseFloat(s.qty),
      totalAmount: parseFloat(s.totalAmount),
      product:     s.product,
    });
  });

  const anomalies = [];

  Object.entries(byProduct).forEach(([productId, entries]) => {
    const qtys = entries.map(e => e.qty);
    const { mean, std } = calcStats(qtys);

    if (std === 0) return;

    entries.forEach(entry => {
      const zScore = Math.abs((entry.qty - mean) / std);

      if (zScore > 2) {
        anomalies.push({
          productId,
          productName:  entry.product?.name || 'Unknown',
          date:         entry.date,
          actualQty:    entry.qty,
          expectedQty:  parseFloat(mean.toFixed(2)),
          zScore:       parseFloat(zScore.toFixed(2)),
          type:         entry.qty > mean ? 'spike' : 'drop',
          severity:     zScore > 3 ? 'high' : 'medium',
        });
      }
    });
  });

  return anomalies.sort((a, b) => b.zScore - a.zScore);
};