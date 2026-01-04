'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Emotion extends Model {
    static associate(models) {
      // 1 Emotion สามารถถูกใช้ในหลาย Log
      Emotion.hasMany(models.Emotion_Log, { foreignKey: 'emotion_id' });
    }
  }
  Emotion.init({
    emotion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    emoji: DataTypes.STRING, // เก็บเป็นตัวอักษร Emoji หรือ Path รูป
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Emotion',
    tableName: 'Emotion',
    timestamps: false
  });
  return Emotion;
};