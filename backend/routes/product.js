const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');

// Create product (Admin/Manager)
router.post('/', auth('Admin'), async (req, res) => {
  try {
    const product = await db.Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  const products = await db.Product.findAll();
  res.json(products);
});

// Get single product
router.get('/:id', async (req, res) => {
  const product = await db.Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

// Update product (Admin/Manager)
router.put('/:id', auth('Admin'), async (req, res) => {
  const product = await db.Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  await product.update(req.body);
  res.json(product);
});

// Delete product (Admin)
router.delete('/:id', auth('Admin'), async (req, res) => {
  const product = await db.Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  await product.destroy();
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;
