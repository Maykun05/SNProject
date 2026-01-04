'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Food_Menu extends Model {
    static associate(models) {
      // 1 Menu สามารถมีได้หลาย Log
      Food_Menu.hasMany(models.Food_Log, { foreignKey: 'menu_id' });
    }
  }
  Food_Menu.init({
    menu_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    calories: DataTypes.NUMERIC,
    unit: DataTypes.STRING,
    protein: DataTypes.NUMERIC,
    carbohydrate: DataTypes.NUMERIC,
    fat: DataTypes.NUMERIC,
    sodium: DataTypes.NUMERIC,
    sugar: DataTypes.NUMERIC
  }, {
    sequelize,
    modelName: 'Food_Menu',
    tableName: 'Food_Menu',
    timestamps: false
  });
  return Food_Menu;
};