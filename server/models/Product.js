const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'pending'),
      defaultValue: 'draft'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { as: 'category', foreignKey: 'categoryId' });
    Product.hasMany(models.ProductImage, { as: 'images', foreignKey: 'productId' });
    Product.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' });
    Product.hasMany(models.Comment, { as: 'comments', foreignKey: 'productId' });
    Product.hasMany(models.OrderItem, { as: 'orderItems', foreignKey: 'productId' });
  };

  return Product;
};