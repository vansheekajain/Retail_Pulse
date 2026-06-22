const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { SaleEntry, Product, Store } = require('../models');
const dayjs = require('dayjs');

// ── Helper — check store belongs to user ──────────────
const getStore = async (storeId, userId) => {
  return Store.findOne({
    where: { id: storeId, ownerId: userId, isActive: true },
  });
};

// ── Create Sale ───────────────────────────────────────
exports.createSale = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      storeId, productId, qty,
      unitPrice, loggedVia, saleDate, note,
    } = req.body;

    const store = await getStore(storeId, req.user.id);
    if (!store) {
      return res.status(403).json({ error: 'Access denied to this store' });
    }

    const product = await Product.findOne({
      where: { id: productId, storeId, isActive: true },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalAmount = parseFloat(qty) * parseFloat(unitPrice);

    const sale = await SaleEntry.create({
      storeId,
      productId,
      qty,
      unitPrice,
      totalAmount,
      loggedVia: loggedVia || 'chat',
      saleDate:  saleDate || dayjs().format('YYYY-MM-DD'),
      note,
    });

    // Update stock
    await product.decrement('currentStock', { by: parseFloat(qty) });

    const result = await SaleEntry.findByPk(sale.id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'unit'],
      }],
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// ── Get Sales ─────────────────────────────────────────
exports.getSales = async (req, res, next) => {
  try {
    const {
      storeId, from, to,
      productId, page = 1, limit = 50,
    } = req.query;

    const store = await getStore(storeId, req.user.id);
    if (!store) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where = { storeId };

    if (from || to) {
      where.saleDate = {};
      if (from) where.saleDate[Op.gte] = from;
      if (to)   where.saleDate[Op.lte] = to;
    }

    if (productId) where.productId = productId;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await SaleEntry.findAndCountAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'unit', 'basePrice'],
      }],
      order: [['saleDate', 'DESC'], ['createdAt', 'DESC']],
      limit:  parseInt(limit),
      offset,
    });

    res.json({
      total: count,
      page:  parseInt(page),
      pages: Math.ceil(count / limit),
      sales: rows,
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Daily Summary ─────────────────────────────────
exports.getDailySummary = async (req, res, next) => {
  try {
    const { storeId, date } = req.query;

    const store = await getStore(storeId, req.user.id);
    if (!store) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const targetDate = date || dayjs().format('YYYY-MM-DD');

    const sales = await SaleEntry.findAll({
      where: { storeId, saleDate: targetDate },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'unit'],
      }],
      order: [['createdAt', 'DESC']],
    });

    const totalRevenue = sales.reduce(
      (sum, s) => sum + parseFloat(s.totalAmount), 0
    );
    const totalItems = sales.reduce(
      (sum, s) => sum + parseFloat(s.qty), 0
    );
    const uniqueProducts = [
      ...new Set(sales.map(s => s.productId))
    ].length;

    res.json({
      date:           targetDate,
      totalRevenue:   parseFloat(totalRevenue.toFixed(2)),
      totalItems:     parseFloat(totalItems.toFixed(2)),
      uniqueProducts,
      transactions:   sales.length,
      sales,
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Sale By Id ────────────────────────────────────
exports.getSaleById = async (req, res, next) => {
  try {
    const { storeId } = req.query;

    const store = await getStore(storeId, req.user.id);
    if (!store) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sale = await SaleEntry.findOne({
      where: { id: req.params.id, storeId },
      include: [{ model: Product, as: 'product' }],
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// ── Update Sale ───────────────────────────────────────
exports.updateSale = async (req, res, next) => {
  try {
    const { storeId, qty, unitPrice, note } = req.body;

    const store = await getStore(storeId, req.user.id);
    if (!store) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sale = await SaleEntry.findOne({
      where: { id: req.params.id, storeId },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const updates = {};
    if (qty       !== undefined) updates.qty       = qty;
    if (unitPrice !== undefined) updates.unitPrice  = unitPrice;
    if (note      !== undefined) updates.note       = note;

    if (updates.qty || updates.unitPrice) {
      updates.totalAmount =
        parseFloat(updates.qty       || sale.qty) *
        parseFloat(updates.unitPrice || sale.unitPrice);
    }

    await sale.update(updates);
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// ── Delete Sale ───────────────────────────────────────
exports.deleteSale = async (req, res, next) => {
  try {
    const { storeId } = req.query;

    const store = await getStore(storeId, req.user.id);
    if (!store) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sale = await SaleEntry.findOne({
      where: { id: req.params.id, storeId },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    await sale.destroy();
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    next(err);
  }
};