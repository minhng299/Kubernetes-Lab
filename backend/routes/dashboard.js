const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');
const { Op, fn, col, literal } = require('sequelize');

// Get dashboard overview (Admin/Manager)
router.get('/overview', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await db.User.count();
    const totalProducts = await db.Product.count();
    const activeUsers = await db.User.count({ where: { isActive: true } });
    const lowStockProducts = await db.Product.count({ 
      where: { stock: { [Op.lt]: 10 } } 
    });
    
    // Get total product value
    const totalValue = await db.Product.sum('price') || 0;
    const totalStock = await db.Product.sum('stock') || 0;
    
    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await db.User.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });
    
    const recentProducts = await db.Product.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });
    
    res.json({
      totalUsers,
      totalProducts,
      activeUsers,
      lowStockProducts,
      totalValue,
      totalStock,
      recentUsers,
      recentProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product statistics by category
router.get('/product-stats', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const categoryStats = await db.Product.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('stock')), 'totalStock'],
        [fn('AVG', col('price')), 'avgPrice'],
        [fn('SUM', literal('price * stock')), 'totalValue']
      ],
      group: ['category'],
      order: [[fn('COUNT', col('id')), 'DESC']]
    });
    
    res.json(categoryStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user role distribution
router.get('/user-stats', auth(['Admin']), async (req, res) => {
  try {
    const roleStats = await db.User.findAll({
      attributes: [
        'role',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['role']
    });
    
    res.json(roleStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent activity timeline
router.get('/recent-activity', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent users
    const recentUsers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) / 2
    });
    
    // Get recent products
    const recentProducts = await db.Product.findAll({
      attributes: ['id', 'name', 'category', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) / 2
    });
    
    // Combine and sort activities
    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_created',
        id: user.id,
        title: `New user registered: ${user.name}`,
        subtitle: user.email,
        createdAt: user.createdAt
      })),
      ...recentProducts.map(product => ({
        type: 'product_created',
        id: product.id,
        title: `New product added: ${product.name}`,
        subtitle: product.category,
        createdAt: product.createdAt
      }))
    ];
    
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(activities.slice(0, parseInt(limit)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly growth data
router.get('/growth-stats', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));
    
    const userGrowth = await db.User.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: monthsAgo }
      },
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']]
    });
    
    const productGrowth = await db.Product.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: monthsAgo }
      },
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']]
    });
    
    res.json({
      userGrowth,
      productGrowth
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;