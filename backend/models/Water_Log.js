'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Water_Log extends Model {
    static associate(models) {
      Water_Log.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Water_Log.init({
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount_ml: DataTypes.DECIMAL,
    log_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Water_Log',
    tableName: 'Water_Log',
    timestamps: false
  });
  return Water_Log;
};