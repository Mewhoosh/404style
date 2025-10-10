const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');

// Relationships
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // alter: true aktualizuje tabele bez usuwania danych
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
  syncDatabase
};