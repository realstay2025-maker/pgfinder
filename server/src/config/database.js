const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Create indexes for better performance
        await createIndexes();

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        const User = require('../models/User');
        const Property = require('../models/Property');
        const Room = require('../models/Room');
        const Tenant = require('../models/Tenant');
        const Payment = require('../models/Payment');

        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });

        // Property indexes
        await Property.collection.createIndex({ ownerId: 1 });
        await Property.collection.createIndex({ 'address.city': 1 });
        await Property.collection.createIndex({ isApproved: 1 });

        // Room indexes
        await Room.collection.createIndex({ propertyId: 1, roomNumber: 1 }, { unique: true });
        await Room.collection.createIndex({ propertyId: 1, gender: 1 });

        // Tenant indexes
        await Tenant.collection.createIndex({ ownerId: 1 });
        await Tenant.collection.createIndex({ propertyId: 1 });
        await Tenant.collection.createIndex({ email: 1 });

        // Payment indexes
        await Payment.collection.createIndex({ tenantId: 1, dueDate: 1 });
        await Payment.collection.createIndex({ propertyId: 1, status: 1 });

        logger.info('Database indexes created successfully');
    } catch (error) {
        logger.error('Error creating indexes:', error);
    }
};

module.exports = connectDB;