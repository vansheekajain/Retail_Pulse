const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('ForecastResult', {
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
  forecastDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  predictedQty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  ciLower: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  ciUpper: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  festiveFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  festiveName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  modelVersion: {
    type: DataTypes.STRING(50),
    defaultValue: 'v1',
  },
}, {
  tableName: 'forecast_results',
  timestamps: true,
});