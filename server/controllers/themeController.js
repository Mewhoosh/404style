const { Theme, User } = require('../models');

// Get all themes
exports.getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll({
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(themes);
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single theme
exports.getTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    res.json(theme);
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create theme (admin only)
exports.createTheme = async (req, res) => {
  try {
    const { name, colorPrimary, colorSecondary, colorAccent, isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault) {
      await Theme.update({ isDefault: false }, { where: { isDefault: true } });
    }

    const theme = await Theme.create({
      name,
      colorPrimary,
      colorSecondary,
      colorAccent,
      isDefault: isDefault || false,
      createdBy: req.userId
    });

    res.status(201).json({
      message: 'Theme created successfully',
      theme
    });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update theme (admin only)
exports.updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const { name, colorPrimary, colorSecondary, colorAccent, isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault && !theme.isDefault) {
      await Theme.update({ isDefault: false }, { where: { isDefault: true } });
    }

    await theme.update({
      name: name || theme.name,
      colorPrimary: colorPrimary || theme.colorPrimary,
      colorSecondary: colorSecondary || theme.colorSecondary,
      colorAccent: colorAccent || theme.colorAccent,
      isDefault: isDefault !== undefined ? isDefault : theme.isDefault
    });

    res.json({
      message: 'Theme updated successfully',
      theme
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete theme (admin only)
exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    if (theme.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default theme' });
    }

    await theme.destroy();
    res.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set user's selected theme
exports.setUserTheme = async (req, res) => {
  try {
    const { themeId } = req.body;
    
    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const user = await User.findByPk(req.userId);
    await user.update({ selectedThemeId: themeId });

    res.json({
      message: 'Theme applied successfully',
      theme
    });
  } catch (error) {
    console.error('Set user theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's theme
exports.getUserTheme = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: Theme, as: 'selectedTheme' }]
    });

    if (!user.selectedTheme) {
      // Return default theme
      const defaultTheme = await Theme.findOne({ where: { isDefault: true } });
      return res.json(defaultTheme);
    }

    res.json(user.selectedTheme);
  } catch (error) {
    console.error('Get user theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};