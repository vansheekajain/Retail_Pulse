const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Store', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  lng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  gstNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM(
      'grocery', 'pharmacy', 'electronics',
      'clothing', 'restaurant', 'other'
    ),
    defaultValue: 'grocery',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'stores',
  timestamps: true,
});