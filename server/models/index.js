const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Slider = require('./Slider');
const SliderItem = require('./SliderItem');

// Product relationships
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Slider relationships
Slider.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Slider.hasMany(SliderItem, { foreignKey: 'sliderId', as: 'items' });

SliderItem.belongsTo(Slider, { foreignKey: 'sliderId', as: 'slider' });
SliderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
  } catch (error) {
    console.error('❌ Database sync error:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Slider,
  SliderItem,
  syncDatabase
};