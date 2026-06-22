const { spawn } = require('child_process');
const path      = require('path');
const { SaleEntry } = require('../models');
const { Op }    = require('sequelize');
const dayjs     = require('dayjs');

const ML_DIR = path.join(__dirname, '../../ml');

const runPython = (script, args) => {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [path.join(ML_DIR, script), ...args]);
    let output = '';
    let error  = '';
    proc.stdout.on('data', d => output += d.toString());
    proc.stderr.on('data', d => error  += d.toString());
    proc.on('close', code => {
      if (code !== 0) { reject(new Error(error)); return; }
      try { resolve(JSON.parse(output.trim())); }
      catch { reject(new Error('Invalid JSON: ' + output)); }
    });
  });
};

exports.getPriceElasticity = async (storeId, productId) => {
  const from = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
  const to   = dayjs().format('YYYY-MM-DD');

  const sales = await SaleEntry.findAll({
    where: {
      storeId,
      productId,
      saleDate: { [Op.between]: [from, to] },
      unitPrice: { [Op.gt]: 0 },
    },
  });

  if (sales.length < 5) {
    throw new Error('Need at least 5 sales records for elasticity analysis');
  }

  const data = sales.map(s => ({
    price: parseFloat(s.unitPrice),
    qty:   parseFloat(s.qty),
  }));

  return runPython('price_elasticity.py', [JSON.stringify(data)]);
};

exports.getCompetitorImpact = async (storeLocation, competitors) => {
  const { spawn } = require('child_process');
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [
      path.join(ML_DIR, 'competitor_factor.py'),
      JSON.stringify(storeLocation),
      JSON.stringify(competitors),
    ]);
    let output = '';
    proc.stdout.on('data', d => output += d.toString());
    proc.on('close', () => {
      try { resolve(JSON.parse(output.trim())); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
};