const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

const env    = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// ── Import models ─────────────────────────────────────
const User           = require('./User')(sequelize);
const Store          = require('./Store')(sequelize);
const Product        = require('./Product')(sequelize);
const SaleEntry      = require('./SaleEntry')(sequelize);
const Supplier       = require('./Supplier')(sequelize);
const PurchaseOrder  = require('./PurchaseOrder')(sequelize);
const POLineItem     = require('./POLineItem')(sequelize);
const ForecastResult = require('./ForecastResult')(sequelize);

// ── Associations ──────────────────────────────────────
User.hasMany(Store,     { foreignKey: 'ownerId', as: 'stores' });
Store.belongsTo(User,   { foreignKey: 'ownerId', as: 'owner' });

Store.hasMany(Product,   { foreignKey: 'storeId', as: 'products' });
Product.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(SaleEntry,     { foreignKey: 'storeId', as: 'sales' });
SaleEntry.belongsTo(Store,   { foreignKey: 'storeId', as: 'store' });
Product.hasMany(SaleEntry,   { foreignKey: 'productId', as: 'sales' });
SaleEntry.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Store.hasMany(Supplier,    { foreignKey: 'storeId', as: 'suppliers' });
Supplier.belongsTo(Store,  { foreignKey: 'storeId', as: 'store' });

Store.hasMany(PurchaseOrder,      { foreignKey: 'storeId',    as: 'purchaseOrders' });
Supplier.hasMany(PurchaseOrder,   { foreignKey: 'supplierId', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Store,    { foreignKey: 'storeId',    as: 'store' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

PurchaseOrder.hasMany(POLineItem,  { foreignKey: 'poId',       as: 'lineItems' });
POLineItem.belongsTo(PurchaseOrder,{ foreignKey: 'poId',       as: 'purchaseOrder' });
POLineItem.belongsTo(Product,      { foreignKey: 'productId',  as: 'product' });

Store.hasMany(ForecastResult,    { foreignKey: 'storeId',   as: 'forecasts' });
Product.hasMany(ForecastResult,  { foreignKey: 'productId', as: 'forecasts' });
ForecastResult.belongsTo(Store,  { foreignKey: 'storeId',   as: 'store' });
ForecastResult.belongsTo(Product,{ foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Store,
  Product,
  SaleEntry,
  Supplier,
  PurchaseOrder,
  POLineItem,
  ForecastResult,
};