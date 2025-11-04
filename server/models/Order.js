const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    // Shipping info
    shippingFirstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingLastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingPostalCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Payment
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Notes
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Order.hasMany(models.OrderItem, { as: 'items', foreignKey: 'orderId' });
  };

  return Order;
};