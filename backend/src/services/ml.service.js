const { spawn } = require('child_process');
const path      = require('path');
const { SaleEntry, Product } = require('../models');
const { Op }    = require('sequelize');
const dayjs     = require('dayjs');

const ML_DIR    = path.join(__dirname, '../../ml');
const MODEL_DIR = path.join(__dirname, '../../ml/models');

// Run a Python script and get JSON output
const runPython = (script, args) => {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [path.join(ML_DIR, script), ...args]);
    let output = '';
    let error  = '';

    proc.stdout.on('data', d => output += d.toString());
    proc.stderr.on('data', d => error  += d.toString());

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(error || 'Python script failed'));
        return;
      }
      try {
        resolve(JSON.parse(output.trim()));
      } catch {
        reject(new Error('Invalid JSON from Python: ' + output));
      }
    });
  });
};

// Prepare training data for a product
const prepareTrainingData = async (storeId, productId, days = 90) => {
  const from = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
  const to   = dayjs().format('YYYY-MM-DD');

  const sales = await SaleEntry.findAll({
    where: {
      storeId,
      productId,
      saleDate: { [Op.between]: [from, to] },
    },
    order: [['saleDate', 'ASC']],
  });

  const product = await Product.findByPk(productId);

  // Aggregate by date
  const byDate = {};
  sales.forEach(s => {
    const d = s.saleDate;
    if (!byDate[d]) byDate[d] = { qty: 0, totalAmount: 0, count: 0 };
    byDate[d].qty         += parseFloat(s.qty);
    byDate[d].totalAmount += parseFloat(s.totalAmount);
    byDate[d].count++;
  });

  // Fill all days
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d   = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    const day = byDate[d] || { qty: 0, totalAmount: 0, count: 0 };
    const avgPrice = day.count > 0
      ? day.totalAmount / day.qty
      : parseFloat(product?.basePrice || 0);

    data.push({
      date:         d,
      qty:          day.qty,
      price:        avgPrice,
      festive_flag: 0,
    });
  }

  return { data, product };
};

// Get ML forecast for a product
exports.getMLForecast = async (storeId, productId, days = 7) => {
  const { data, product } = await prepareTrainingData(storeId, productId);

  if (data.length < 14) {
    throw new Error('Need at least 14 days of sales data for ML forecast');
  }

  const historyJson = JSON.stringify(data);
  const modelPath   = path.join(MODEL_DIR, `${storeId}_${productId}.joblib`);
  const avgPrice    = parseFloat(product?.basePrice || 100);

  // Save training data temporarily
  const fs       = require('fs');
  const dataPath = path.join(MODEL_DIR, `${storeId}_${productId}_data.json`);

  if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data));

  // Train model
  await runPython('train.py', [dataPath, modelPath]);

  // Get predictions
  const predictions = await runPython('predict.py', [
    modelPath, historyJson, String(days), String(avgPrice),
  ]);

  return {
    product: {
      id:   product?.id,
      name: product?.name,
      unit: product?.unit,
    },
    forecasts: predictions,
  };
};