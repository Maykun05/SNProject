'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sleep_Log extends Model {
    static associate(models) {
      Sleep_Log.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Sleep_Log.init({
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sleep_at: DataTypes.DATE, // ใช้ TIMESTAMPTZ ตาม Diagram
    wake_at: DataTypes.DATE,
    sleep_duration: DataTypes.INTEGER, // หน่วยนาที หรือ ชั่วโมง
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Sleep_Log',
    tableName: 'Sleep_Log',
    timestamps: false
  });
  return Sleep_Log;
};