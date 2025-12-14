const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Create product (Admin/Manager)
router.post('/', auth('Admin'), async (req, res) => {
  try {
    const product = await db.Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all products with search and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search by name or description
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter by category
    if (category) {
      whereClause.category = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Filter by stock availability
    if (inStock !== undefined) {
      if (inStock === 'true') {
        whereClause.stock = { [Op.gt]: 0 };
      } else if (inStock === 'false') {
        whereClause.stock = { [Op.eq]: 0 };
      }
    }
    
    const { count, rows: products } = await db.Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
    
    res.json({
      products,
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

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (Admin/Manager)
router.put('/:id', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    await product.update(req.body);
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth('Admin'), async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk update stock (Admin/Manager)
router.patch('/bulk/stock', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, stock}
    
    const results = [];
    for (const update of updates) {
      const product = await db.Product.findByPk(update.id);
      if (product) {
        await product.update({ stock: update.stock });
        results.push({ id: update.id, success: true });
      } else {
        results.push({ id: update.id, success: false, error: 'Product not found' });
      }
    }
    
    res.json({ message: 'Bulk update completed', results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get low stock products
router.get('/alerts/low-stock', auth(['Admin', 'Manager']), async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockProducts = await db.Product.findAll({
      where: {
        stock: { [Op.lt]: parseInt(threshold) }
      },
      order: [['stock', 'ASC']]
    });
    
    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
