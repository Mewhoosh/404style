const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Slider = require('./Slider');
const SliderItem = require('./SliderItem');
const Theme = require('./Theme');

// Najpierw Theme relationships (musi być przed User)
Theme.belongsTo(User, { foreignKey: 'createdBy', as: 'creator', constraints: false });

// Potem User relationships
User.belongsTo(Theme, { foreignKey: 'selectedThemeId', as: 'selectedTheme', constraints: false });

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
    // Sync w odpowiedniej kolejności
    await Theme.sync({ alter: true });
    await User.sync({ alter: true });
    await Category.sync({ alter: true });
    await Product.sync({ alter: true });
    await ProductImage.sync({ alter: true });
    await Slider.sync({ alter: true });
    await SliderItem.sync({ alter: true });
    
    console.log('✅ Database synced');
    
    // Create default theme if none exists
    const defaultTheme = await Theme.findOne({ where: { isDefault: true } });
    if (!defaultTheme) {
      await Theme.create({
        name: 'Default Dark',
        colorPrimary: '#0a0e27',
        colorSecondary: '#ff6b35',
        colorAccent: '#f7f7f7',
        isDefault: true
      });
      console.log('Default theme created');
    }
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
  Slider,
  SliderItem,
  Theme,
  syncDatabase
};