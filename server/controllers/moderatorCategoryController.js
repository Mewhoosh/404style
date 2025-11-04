const { ModeratorCategory, User, Category } = require('../models');

// Get all moderator-category assignments
exports.getAll = async (req, res) => {
  try {
    const assignments = await ModeratorCategory.findAll({
      include: [
        {
          model: User,
          as: 'moderator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign moderator to category
exports.assignModeratorToCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.body;

    // Check if user is moderator
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'moderator') {
      return res.status(400).json({ message: 'User is not a moderator' });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if assignment already exists
    const existing = await ModeratorCategory.findOne({
      where: { userId, categoryId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Assignment already exists' });
    }

    const assignment = await ModeratorCategory.create({ userId, categoryId });

    res.status(201).json({
      message: 'Moderator assigned to category',
      assignment
    });
  } catch (error) {
    console.error('Assign moderator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove moderator from category
exports.removeModeratorFromCategory = async (req, res) => {
  try {
    const assignment = await ModeratorCategory.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.destroy();

    res.json({ message: 'Moderator removed from category' });
  } catch (error) {
    console.error('Remove moderator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get moderator's assigned categories
exports.getModeratorCategories = async (req, res) => {
  try {
    const assignments = await ModeratorCategory.findAll({
      where: { userId: req.userId },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get moderator categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};