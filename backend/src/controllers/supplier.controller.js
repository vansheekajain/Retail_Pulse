const { Supplier, PurchaseOrder, POLineItem, Product } = require('../models');
const { Store } = require('../models');
const dayjs = require('dayjs');

const getStore = (storeId, userId) =>
  Store.findOne({ where: { id: storeId, ownerId: userId } });

// ── Suppliers ─────────────────────────────────────────
exports.getSuppliers = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const store = await getStore(storeId, req.user.id);
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const suppliers = await Supplier.findAll({
      where: { storeId, isActive: true },
      order: [['name', 'ASC']],
    });
    res.json(suppliers);
  } catch (err) { next(err); }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { storeId, name, contactName, phone, email, address, leadDays } = req.body;
    const store = await getStore(storeId, req.user.id);
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const supplier = await Supplier.create({
      storeId, name, contactName, phone, email, address, leadDays,
    });
    res.status(201).json(supplier);
  } catch (err) { next(err); }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const fields = ['name', 'contactName', 'phone', 'email', 'address', 'leadDays'];
    fields.forEach(f => { if (req.body[f] !== undefined) supplier[f] = req.body[f]; });
    await supplier.save();
    res.json(supplier);
  } catch (err) { next(err); }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    await supplier.update({ isActive: false });
    res.json({ message: 'Supplier removed' });
  } catch (err) { next(err); }
};

// ── Purchase Orders ───────────────────────────────────
exports.createPO = async (req, res, next) => {
  try {
    const { storeId, supplierId, items, notes } = req.body;
    const store = await getStore(storeId, req.user.id);
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const expectedDelivery = dayjs()
      .add(supplier.leadDays, 'day')
      .format('YYYY-MM-DD');

    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += parseFloat(item.qty) * parseFloat(item.unitPrice);
    });

    const po = await PurchaseOrder.create({
      storeId, supplierId, totalAmount, notes, expectedDelivery,
    });

    // Create line items
    await Promise.all(items.map(item =>
      POLineItem.create({
        poId:        po.id,
        productId:   item.productId,
        qty:         item.qty,
        unitPrice:   item.unitPrice,
        totalAmount: parseFloat(item.qty) * parseFloat(item.unitPrice),
      })
    ));

    const result = await PurchaseOrder.findByPk(po.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        {
          model: POLineItem, as: 'lineItems',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.getPOs = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const store = await getStore(storeId, req.user.id);
    if (!store) return res.status(403).json({ error: 'Access denied' });

    const pos = await PurchaseOrder.findAll({
      where: { storeId },
      include: [
        { model: Supplier, as: 'supplier' },
        {
          model: POLineItem, as: 'lineItems',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(pos);
  } catch (err) { next(err); }
};

exports.updatePOStatus = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ error: 'PO not found' });
    await po.update({ status: req.body.status });
    res.json(po);
  } catch (err) { next(err); }
};