const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: 'mysql',
    logging: false,
    pool: config.pool
  }
);

// Import models
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const ProductImage = require('./ProductImage')(sequelize);
const Theme = require('./Theme')(sequelize);
const UserThemePreference = require('./UserThemePreference')(sequelize);
const Slider = require('./Slider')(sequelize);
const SliderItem = require('./SliderItem')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

// Define relationships
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasOne(UserThemePreference, { foreignKey: 'userId', as: 'themePreference' });
UserThemePreference.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserThemePreference.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });

Slider.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Slider.hasMany(SliderItem, { foreignKey: 'sliderId', as: 'items' });
SliderItem.belongsTo(Slider, { foreignKey: 'sliderId', as: 'slider' });
SliderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order relationships
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false, alter: false });
    console.log('Database synced');
  } catch (error) {
    console.error('Database sync error:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Theme,
  UserThemePreference,
  Slider,
  SliderItem,
  Order,
  OrderItem,
  syncDatabase
};