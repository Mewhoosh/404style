const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'moderator', 'admin'),
      defaultValue: 'user'
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasMany(models.Product, { as: 'products', foreignKey: 'createdBy' });
    User.hasMany(models.Order, { as: 'orders', foreignKey: 'userId' });
    User.hasMany(models.Comment, { as: 'comments', foreignKey: 'userId' });
    User.hasMany(models.CommentVote, { as: 'votes', foreignKey: 'userId' });
    User.hasMany(models.Notification, { as: 'notifications', foreignKey: 'userId' });
    User.hasMany(models.ModeratorCategory, { as: 'moderatorCategories', foreignKey: 'userId' });
    User.hasOne(models.UserThemePreference, { as: 'themePreference', foreignKey: 'userId' });
  };

  return User;
};