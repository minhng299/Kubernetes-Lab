const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Get user profile
router.get('/profile', auth(), async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', auth(), async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await db.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.update({ name, phone, address, avatar });
    const updatedUser = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken'] }
    });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Change password
router.put('/change-password', auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.User.findByPk(req.user.id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await user.update({ password: hashedPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });
    
    // In production, send email with reset link
    // For now, return token for testing
    res.json({ 
      message: 'Password reset token generated', 
      resetToken: resetToken // Remove in production
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await db.User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users (Admin only)
router.get('/', auth('Admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    if (role) {
      whereClause.role = role;
    }
    
    const { count, rows: users } = await db.User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordToken'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;