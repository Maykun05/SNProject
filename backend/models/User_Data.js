'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User_Data extends Model {
    static associate(models) {
      User_Data.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  User_Data.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    weight: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    birth_date: DataTypes.DATE,
    gender: DataTypes.STRING,
    exercise_level: DataTypes.INTEGER,
    // เพิ่มฟิลด์สำหรับ Gamification (ถ้ายังไม่มีใน SQL ให้ไปเพิ่มที่ pgAdmin ด้วยนะครับ)
    tree_exp: { type: DataTypes.INTEGER, defaultValue: 0 },
    tree_level: { type: DataTypes.INTEGER, defaultValue: 0 } 
  }, {
    sequelize,
    modelName: 'User_Data',
    tableName: 'User_Data',
    timestamps: false
  });
  return User_Data;
};