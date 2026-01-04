'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Step_Log extends Model {
    static associate(models) {
      Step_Log.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Step_Log.init({
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    step_count: DataTypes.INTEGER,
    log_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Step_Log',
    tableName: 'Step_Log',
    timestamps: false
  });
  return Step_Log;
};