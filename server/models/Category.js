const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'categories',
    timestamps: true
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, { as: 'products', foreignKey: 'categoryId' });
    Category.belongsTo(models.Category, { as: 'parent', foreignKey: 'parentId' });
    Category.hasMany(models.Category, { as: 'children', foreignKey: 'parentId' });
    Category.hasMany(models.ModeratorCategory, { as: 'moderators', foreignKey: 'categoryId' });
  };

  return Category;
};