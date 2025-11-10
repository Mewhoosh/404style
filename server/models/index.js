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
const Comment = require('./Comment')(sequelize, Sequelize.DataTypes);
const CommentVote = require('./CommentVote')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
const ModeratorCategory = require('./ModeratorCategory')(sequelize, Sequelize.DataTypes);

// Collect all models
const models = {
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
  Comment,
  CommentVote,
  Notification,
  ModeratorCategory
};

// Initialize associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

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
  ...models,
  syncDatabase
};