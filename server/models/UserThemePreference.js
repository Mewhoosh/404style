const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserThemePreference = sequelize.define('UserThemePreference', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    themeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'user_theme_preferences',
    timestamps: true
  });

  UserThemePreference.associate = (models) => {
    UserThemePreference.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    UserThemePreference.belongsTo(models.Theme, { as: 'theme', foreignKey: 'themeId' });
  };

  return UserThemePreference;
};