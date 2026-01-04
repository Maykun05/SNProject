'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Food_Log extends Model {
    static associate(models) {
      Food_Log.belongsTo(models.User, { foreignKey: 'user_id' });
      Food_Log.belongsTo(models.Food_Menu, { foreignKey: 'menu_id' });
    }
  }
  Food_Log.init({
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: DataTypes.DECIMAL,
    log_date: DataTypes.DATEONLY,
    log_time: DataTypes.TIME,
    user_id: DataTypes.INTEGER,
    menu_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Food_Log',
    tableName: 'Food_Log',
    timestamps: false
  });
  return Food_Log;
};