const { SaleEntry, ForecastResult } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { getFestiveInfo, getFestiveMultiplier } = require('./festive.service');

// Simple moving average forecast
const movingAverage = (values, window = 7) => {
  if (values.length === 0) return 0;
  const recent = values.slice(-window);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
};

// Calculate confidence interval
const confidenceInterval = (values, predicted, confidence = 0.95) => {
  if (values.length < 2) return { lower: predicted * 0.8, upper: predicted * 1.2 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  const margin = 1.96 * std;

  return {
    lower: Math.max(0, parseFloat((predicted - margin).toFixed(2))),
    upper: parseFloat((predicted + margin).toFixed(2)),
  };
};

// Generate forecast for a product
exports.generateForecast = async (storeId, productId, days = 7) => {
  // Get last 90 days of sales
  const from = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
  const to   = dayjs().format('YYYY-MM-DD');

  const sales = await SaleEntry.findAll({
    where: {
      storeId,
      productId,
      saleDate: { [Op.between]: [from, to] },
    },
    order: [['saleDate', 'ASC']],
  });

  // Build daily qty map
  const dailyMap = {};
  sales.forEach(s => {
    const d = s.saleDate;
    dailyMap[d] = (dailyMap[d] || 0) + parseFloat(s.qty);
  });

  // Fill in zeros for missing days
  const allDays = [];
  for (let i = 89; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    allDays.push(dailyMap[d] || 0);
  }

  const forecasts = [];

  // Generate forecast for next N days
  for (let i = 1; i <= days; i++) {
    const forecastDate = dayjs().add(i, 'day').format('YYYY-MM-DD');
    let predicted = movingAverage(allDays, 7);

    // Apply day-of-week factor
    const dow = dayjs(forecastDate).day();
    const dowFactors = [0.8, 1.0, 1.0, 1.0, 1.1, 1.3, 1.2];
    predicted *= dowFactors[dow];

    // Apply festive multiplier
    const festive = getFestiveInfo(forecastDate);
    if (festive.isFestive) {
      predicted *= getFestiveMultiplier(festive.name);
    }

    predicted = Math.max(0, parseFloat(predicted.toFixed(2)));

    const ci = confidenceInterval(allDays, predicted);

    // Save to DB
    const existing = await ForecastResult.findOne({
      where: { storeId, productId, forecastDate },
    });

    if (existing) {
      await existing.update({
        predictedQty: predicted,
        ciLower:      ci.lower,
        ciUpper:      ci.upper,
        festiveFlag:  festive.isFestive,
        festiveName:  festive.name,
      });
      forecasts.push(existing);
    } else {
      const result = await ForecastResult.create({
        storeId,
        productId,
        forecastDate,
        predictedQty: predicted,
        ciLower:      ci.lower,
        ciUpper:      ci.upper,
        festiveFlag:  festive.isFestive,
        festiveName:  festive.name,
      });
      forecasts.push(result);
    }

    // Add predicted to rolling data
    allDays.push(predicted);
  }

  return forecasts;
};

// Get existing forecasts
exports.getForecasts = async (storeId, productId, days = 7) => {
  const from = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const to   = dayjs().add(days, 'day').format('YYYY-MM-DD');

  return ForecastResult.findAll({
    where: {
      storeId,
      productId,
      forecastDate: { [Op.between]: [from, to] },
    },
    order: [['forecastDate', 'ASC']],
  });
};