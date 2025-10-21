const { Theme, UserThemePreference } = require('../models');

// Get all themes (admin only)
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

// Get default theme (public)
exports.getDefaultTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne({ where: { isDefault: true } });
    
    if (!theme) {
      // Create default theme if none exists
      theme = await Theme.create({
        name: 'Default',
        colorPrimary: '#0a0e27',
        colorSecondary: '#93cf08',
        colorAccent: '#f7f7f7',
        isDefault: true
      });
    }
    
    res.json(theme);
  } catch (error) {
    console.error('Get default theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's active theme (logged in users)
exports.getUserTheme = async (req, res) => {
  try {
    // Check if user has preference
    const preference = await UserThemePreference.findOne({
      where: { userId: req.userId },
      include: [{ model: Theme, as: 'theme' }]
    });

    if (preference && preference.theme) {
      return res.json(preference.theme);
    }

    // Return default theme
    let theme = await Theme.findOne({ where: { isDefault: true } });
    
    if (!theme) {
      theme = await Theme.create({
        name: 'Default',
        colorPrimary: '#0a0e27',
        colorSecondary: '#93cf08',
        colorAccent: '#f7f7f7',
        isDefault: true
      });
    }

    res.json(theme);
  } catch (error) {
    console.error('Get user theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set user's theme preference
exports.setUserTheme = async (req, res) => {
  try {
    const { themeId } = req.body;

    // Verify theme exists
    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    // Update or create preference
    const [preference, created] = await UserThemePreference.upsert({
      userId: req.userId,
      themeId: themeId
    }, {
      returning: true
    });

    res.json({
      message: 'Theme preference updated',
      theme
    });
  } catch (error) {
    console.error('Set user theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create theme (admin only)
exports.createTheme = async (req, res) => {
  try {
    const { name, colorPrimary, colorSecondary, colorAccent } = req.body;

    const theme = await Theme.create({
      name,
      colorPrimary,
      colorSecondary,
      colorAccent,
      isDefault: false,
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

    const { name, colorPrimary, colorSecondary, colorAccent } = req.body;

    await theme.update({
      name: name || theme.name,
      colorPrimary: colorPrimary || theme.colorPrimary,
      colorSecondary: colorSecondary || theme.colorSecondary,
      colorAccent: colorAccent || theme.colorAccent
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

    // Delete user preferences for this theme
    await UserThemePreference.destroy({ where: { themeId: theme.id } });

    await theme.destroy();
    res.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};