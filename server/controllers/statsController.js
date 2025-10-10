const { User, Product, Category, sequelize } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    // Count products
    const productsCount = await Product.count();

    // Count users
    const usersCount = await User.count({
      where: { role: 'user' }
    });

    // Count categories
    const categoriesCount = await Category.count();

    // Calculate total revenue (mock for now - will implement with orders later)
    const totalRevenue = await Product.sum('price') || 0;

    res.json({
      products: productsCount,
      users: usersCount,
      categories: categoriesCount,
      revenue: totalRevenue
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};