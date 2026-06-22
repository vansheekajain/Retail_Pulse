const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'draft', 'sent', 'confirmed',
      'delivered', 'cancelled'
    ),
    defaultValue: 'draft',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expectedDelivery: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'purchase_orders',
  timestamps: true,
});