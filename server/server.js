// ✅ DOTENV NA SAMYM POCZĄTKU!
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { syncDatabase } = require('./models');
const path = require('path');

const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const moderatorCategoryRoutes = require('./routes/moderatorCategories');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (required for Passport)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: '404 Style API is running!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/themes', require('./routes/themes'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/themes', require('./routes/themes'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sliders', require('./routes/sliders'));
const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/moderator-categories', moderatorCategoryRoutes);

app.use('/api/users', userRoutes);

// Sync database and start server
const PORT = process.env.PORT || 5000;
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
