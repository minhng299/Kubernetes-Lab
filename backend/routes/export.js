const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');
const json2csv = require('json2csv').parse;

// Export products to CSV
router.get('/products/csv', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const products = await db.Product.findAll({
      attributes: ['id', 'name', 'category', 'description', 'price', 'stock', 'createdAt', 'updatedAt']
    });
    
    const csv = json2csv(products, {
      fields: ['id', 'name', 'category', 'description', 'price', 'stock', 'createdAt', 'updatedAt']
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export users to CSV (Admin only)
router.get('/users/csv', auth('Admin'), async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'isActive', 'createdAt', 'lastLoginAt']
    });
    
    const csv = json2csv(users, {
      fields: ['id', 'name', 'email', 'phone', 'role', 'isActive', 'createdAt', 'lastLoginAt']
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export dashboard data to JSON
router.get('/dashboard/json', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const totalProducts = await db.Product.count();
    const totalValue = await db.Product.sum('price') || 0;
    const totalStock = await db.Product.sum('stock') || 0;
    
    const categoryStats = await db.Product.findAll({
      attributes: [
        'category',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('stock')), 'totalStock']
      ],
      group: ['category']
    });
    
    const report = {
      generatedAt: new Date().toISOString(),
      overview: {
        totalUsers,
        totalProducts,
        totalValue,
        totalStock
      },
      categoryBreakdown: categoryStats
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-report.json');
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;