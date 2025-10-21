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

// Define relationships
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });

ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Theme relationships
User.hasOne(UserThemePreference, { foreignKey: 'userId', as: 'themePreference' });
UserThemePreference.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserThemePreference.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database synced');
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
  syncDatabase
};