module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('comment_approved', 'comment_rejected', 'comment_reply', 'product_approved', 'product_rejected', 'order_status'),
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of related entity (comment, product, order)'
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of related entity'
    }
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  };

  return Notification;
};