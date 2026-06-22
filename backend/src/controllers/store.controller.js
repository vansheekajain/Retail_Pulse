const { validationResult } = require('express-validator');
const { Store, Product } = require('../models');

// ── Create Store ──────────────────────────────────────
exports.createStore = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      name, address, city, state,
      pincode, lat, lng, gstNumber, category,
    } = req.body;

    const store = await Store.create({
      ownerId: req.user.id,
      name, address, city, state,
      pincode, lat, lng, gstNumber, category,
    });

    res.status(201).json(store);
  } catch (err) {
    next(err);
  }
};

// ── Get My Stores ─────────────────────────────────────
exports.getMyStores = async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      where: { ownerId: req.user.id, isActive: true },
      order: [['createdAt', 'ASC']],
    });
    res.json(stores);
  } catch (err) {
    next(err);
  }
};

// ── Get Store By Id ───────────────────────────────────
exports.getStoreById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const store = await Store.findOne({
      where: {
        id: req.params.storeId,
        ownerId: req.user.id,
        isActive: true,
      },
      include: [{
        model: Product,
        as: 'products',
        where: { isActive: true },
        required: false,
      }],
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (err) {
    next(err);
  }
};

// ── Update Store ──────────────────────────────────────
exports.updateStore = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const store = await Store.findOne({
      where: { id: req.params.storeId, ownerId: req.user.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const fields = [
      'name', 'address', 'city', 'state',
      'pincode', 'lat', 'lng', 'gstNumber', 'category',
    ];
    fields.forEach(f => {
      if (req.body[f] !== undefined) store[f] = req.body[f];
    });

    await store.save();
    res.json(store);
  } catch (err) {
    next(err);
  }
};

// ── Delete Store ──────────────────────────────────────
exports.deleteStore = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const store = await Store.findOne({
      where: { id: req.params.storeId, ownerId: req.user.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await store.update({ isActive: false });
    res.json({ message: 'Store removed' });
  } catch (err) {
    next(err);
  }
};

// ── Add Product ───────────────────────────────────────
exports.addProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const store = await Store.findOne({
      where: { id: req.params.storeId, ownerId: req.user.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const {
      name, nameHi, sku, unit,
      basePrice, currentStock, reorderLevel,
    } = req.body;

    const product = await Product.create({
      storeId: store.id,
      name, nameHi, sku, unit,
      basePrice, currentStock, reorderLevel,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// ── Get Products ──────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const store = await Store.findOne({
      where: { id: req.params.storeId, ownerId: req.user.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const products = await Product.findAll({
      where: { storeId: store.id, isActive: true },
      order: [['name', 'ASC']],
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ── Update Product ────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const product = await Product.findOne({
      where: {
        id: req.params.productId,
        storeId: req.params.storeId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const fields = [
      'name', 'nameHi', 'sku', 'unit',
      'basePrice', 'currentStock', 'reorderLevel',
    ];
    fields.forEach(f => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ── Delete Product ────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const product = await Product.findOne({
      where: {
        id: req.params.productId,
        storeId: req.params.storeId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({ isActive: false });
    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};