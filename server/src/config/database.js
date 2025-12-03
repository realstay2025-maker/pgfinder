const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('Attempting MongoDB connection with URI:', mongoUri ? 'URI found' : 'URI missing');
        
        if (!mongoUri) {
            throw new Error('MongoDB URI not found in environment variables');
        }
        
        const conn = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Create indexes for better performance
        await createIndexes();

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Database connection failed:', error);
        // Don't exit in production to allow debugging
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

const createIndexes = async () => {
    try {
        const User = require('../models/User');
        const Property = require('../models/Property');
        const Room = require('../models/Room');
        const Tenant = require('../models/Tenant');
        const Payment = require('../models/Payment');

        const createIndexSafely = async (collection, indexSpec, options = {}) => {
            try {
                await collection.createIndex(indexSpec, options);
            } catch (error) {
                if (error.code !== 86) { // Ignore index already exists error
                    throw error;
                }
            }
        };

        // User indexes
        await createIndexSafely(User.collection, { email: 1 }, { unique: true });
        await createIndexSafely(User.collection, { role: 1 });

        // Property indexes
        await createIndexSafely(Property.collection, { ownerId: 1 });
        await createIndexSafely(Property.collection, { 'address.city': 1 });
        await createIndexSafely(Property.collection, { isApproved: 1 });

        // Room indexes
        await createIndexSafely(Room.collection, { propertyId: 1, roomNumber: 1 }, { unique: true });
        await createIndexSafely(Room.collection, { propertyId: 1, gender: 1 });

        // Tenant indexes
        await createIndexSafely(Tenant.collection, { ownerId: 1 });
        await createIndexSafely(Tenant.collection, { propertyId: 1 });
        await createIndexSafely(Tenant.collection, { email: 1 });

        // Payment indexes
        await createIndexSafely(Payment.collection, { tenantId: 1, dueDate: 1 });
        await createIndexSafely(Payment.collection, { propertyId: 1, status: 1 });

        logger.info('Database indexes created successfully');
    } catch (error) {
        logger.error('Error creating indexes:', error);
    }
};

module.exports = connectDB;