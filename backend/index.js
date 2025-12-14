const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const exportRoutes = require('./routes/export');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('OCOP Website Running');
});

// Sync DB with force option to update schema
db.sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synced successfully');
  
  // Create default admin user if none exists
  try {
    const adminExists = await db.User.findOne({
      where: { role: 'Admin' }
    });
    
    if (!adminExists) {
      const defaultAdmin = await db.User.create({
        name: 'admin',
        email: 'admin@ocop.com',
        password: 'admin123', // This will be hashed by the beforeCreate hook
        role: 'Admin',
        phone: '+84123456789',
        address: 'OCOP Management Office',
        isActive: true
      });
      console.log('✅ Default admin user created:');
      console.log('   Email: admin@ocop.com');
      console.log('   Password: admin123');
      console.log('   Please change the password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err.message);
  }
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database sync failed:', err);
});
