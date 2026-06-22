const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('SaleEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  qty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  loggedVia: {
    type: DataTypes.ENUM('chat', 'form', 'whatsapp', 'api'),
    defaultValue: 'chat',
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  saleDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  saleTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
}, {
  tableName: 'sale_entries',
  timestamps: true,
  indexes: [
    { fields: ['storeId', 'saleDate'] },
    { fields: ['productId', 'saleDate'] },
  ],
});