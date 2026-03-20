'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // นิยามความสัมพันธ์ 1:1 กับ User_Data
      User.hasOne(models.User_Data, { foreignKey: 'user_id' });
      // นิยามความสัมพันธ์กับ Log ต่างๆ (1:N)
      User.hasMany(models.Water_Log, { foreignKey: 'user_id' });
      User.hasMany(models.Food_Log, { foreignKey: 'user_id' });
      User.hasMany(models.Step_Log, { foreignKey: 'user_id' });
      User.hasMany(models.Sleep_Log, { foreignKey: 'user_id' });
      User.hasMany(models.Emotion_Log, { foreignKey: 'user_id' });
    }
  }
  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: {
      type: DataTypes.TEXT,
      unique: true
    },
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'User', // ให้ตรงกับใน pgAdmin
    timestamps: false
  });
  return User;
};