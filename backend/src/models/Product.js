const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  nameHi: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  unit: {
    type: DataTypes.ENUM(
      'kg', 'g', 'litre', 'ml',
      'piece', 'dozen', 'box', 'packet'
    ),
    defaultValue: 'piece',
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  currentStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  reorderLevel: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
});