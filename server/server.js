// server/index.js (Updated)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/pgmanagement?retryWrites=true&w=majority';

// Import Routes
const authRoutes = require('./src/routes/auth'); 
const propertyRoutes = require('./src/routes/property');
const roomRoutes = require('./src/routes/room');
const tenantRoutes = require('./src/routes/tenant');
const paymentRoutes = require('./src/routes/payment');
const ownerRoutes = require('./src/routes/owner');
const complaintRoutes = require('./src/routes/complaint');
const adminRoutes = require('./src/routes/admin');
const contactRoutes = require('./src/routes/contact');
const bookingRoutes = require('./src/routes/booking');
const noticeRoutes = require('./src/routes/notice');
const { scheduleSubscriptionReminders } = require('./src/utils/emailReminder');


// const ownerSetupRoutes = require('./src/routes/owner_setup');

// const adminMetricsRouter = require('./routes/admin'); // Keep previous routes if you still use them

// Security Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", process.env.NODE_ENV === 'production' ? "" : "http://localhost:5000"].filter(Boolean),
        },
    },
}));

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static('uploads'));

// 1. CONNECT TO DB (replace with your actual connection logic)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('DB Connection Error:', err));

// 2. MOUNT ROUTES
app.use('/api/auth', authRoutes); // NEW AUTH ROUTES
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notices', noticeRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔒 Security features enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Start subscription reminder scheduler
    scheduleSubscriptionReminders();
    console.log(`📧 Subscription reminder scheduler started`);
});