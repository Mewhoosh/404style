const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Theme = sequelize.define('Theme', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    colorPrimary: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#0a0e27'
    },
    colorSecondary: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#93cf08'
    },
    colorAccent: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#f7f7f7'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'themes',
    timestamps: true
  });

  return Theme;
};