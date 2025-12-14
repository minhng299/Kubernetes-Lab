const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Name, email, and password are required' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists by email only
    const existingUser = await db.User.findOne({ 
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    const userData = { 
      name, 
      email, 
      password, 
      role: role || 'User',
      isActive: true 
    };
    
    // Try to add phone, but don't fail if column doesn't exist
    try {
      if (phone) {
        userData.phone = phone;
      }
      const user = await db.User.create(userData);
      
      res.json({ 
        message: 'User registered successfully', 
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (phoneError) {
      // If phone column doesn't exist, try without it
      if (phoneError.message.includes('phone')) {
        console.log('Phone column not found, creating user without phone field');
        delete userData.phone;
        const user = await db.User.create(userData);
        
        res.json({ 
          message: 'User registered successfully (phone field will be available after database update)', 
          userId: user.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } else {
        throw phoneError;
      }
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors ? err.errors.map(e => e.message) : 'Database error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Update last login time
    await user.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info
router.get('/me', auth(), async (req, res) => {
  res.json(req.user);
});

// Logout (for token blacklisting in production)
router.post('/logout', auth(), async (req, res) => {
  try {
    // In production, you would add the token to a blacklist
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
