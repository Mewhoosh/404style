module.exports = (sequelize, DataTypes) => {
  const CommentVote = sequelize.define('CommentVote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[-1, 1]]
      },
      comment: '1 for upvote, -1 for downvote'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Comments',
        key: 'id'
      }
    }
  });

  CommentVote.associate = (models) => {
    CommentVote.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    CommentVote.belongsTo(models.Comment, { as: 'comment', foreignKey: 'commentId' });
  };

  return CommentVote;
};