const { User, ModeratorCategory, Category, Comment, Order } = require('../models');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
      include: [
        {
          model: ModeratorCategory,
          as: 'moderatorCategories',
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get statistics for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const userData = user.toJSON();
      
      userData.stats = {
        comments: await Comment.count({ where: { userId: user.id } }),
        orders: await Order.count({ where: { userId: user.id } })
      };

      return userData;
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot change own role
    if (user.id === req.userId) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    await user.update({ role });

    res.json({
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot delete yourself
    if (user.id === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};