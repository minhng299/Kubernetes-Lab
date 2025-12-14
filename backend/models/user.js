const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'User' },
    avatar: DataTypes.STRING,
    address: DataTypes.TEXT,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    lastLoginAt: DataTypes.DATE,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  });

  // Hash password trước khi tạo
  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  return User;
};
