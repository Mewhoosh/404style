const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Slider = sequelize.define('Slider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'sliders',
    timestamps: true
  });

  Slider.associate = (models) => {
    Slider.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' });
    Slider.hasMany(models.SliderItem, { as: 'items', foreignKey: 'sliderId' });
  };

  return Slider;
};