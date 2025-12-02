// server/index.js (Updated)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { securityMiddleware, generalLimiter, authLimiter } = require('./src/middleware/security');

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

// Security middleware
app.use(securityMiddleware);

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static('uploads'));

// Serve tenant documents (protected route)
app.use('/uploads/tenant-documents', (req, res, next) => {
    // Add authentication check here if needed
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static('uploads/tenant-documents'));

// Connect to MongoDB
connectDB();

// Health check routes
app.use('/api', require('./src/routes/health'));

// API Routes
app.use('/api/auth', authRoutes);
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



// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});

// Start Server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔒 Security features enabled`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Start subscription reminder scheduler
    scheduleSubscriptionReminders();
    logger.info(`📧 Subscription reminder scheduler started`);
});