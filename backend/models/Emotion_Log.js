'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Emotion_Log extends Model {
    static associate(models) {
      Emotion_Log.belongsTo(models.User, { foreignKey: 'user_id' });
      Emotion_Log.belongsTo(models.Emotion, { foreignKey: 'emotion_id' });
    }
  }
  Emotion_Log.init({
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    note: DataTypes.STRING,
    log_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    user_id: DataTypes.INTEGER,
    emotion_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Emotion_Log',
    tableName: 'Emotion_Log',
    timestamps: false
  });
  return Emotion_Log;
};