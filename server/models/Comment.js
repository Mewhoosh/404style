module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Net votes (upvotes - downvotes)'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Comments',
        key: 'id'
      },
      comment: 'For nested replies'
    },
    moderatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    moderatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { as: 'author', foreignKey: 'userId' });
    Comment.belongsTo(models.Product, { as: 'product', foreignKey: 'productId' });
    Comment.belongsTo(models.Comment, { as: 'parent', foreignKey: 'parentId' });
    Comment.hasMany(models.Comment, { as: 'replies', foreignKey: 'parentId' });
    Comment.belongsTo(models.User, { as: 'moderator', foreignKey: 'moderatedBy' });
    Comment.hasMany(models.CommentVote, { as: 'votes', foreignKey: 'commentId' });
  };

  return Comment;
};