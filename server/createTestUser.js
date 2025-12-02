require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/pgmanagement?retryWrites=true&w=majority');
        console.log('Connected to MongoDB');

        // Check if test user exists
        const existingUser = await User.findOne({ email: 'owner@test.com' });
        if (existingUser) {
            console.log('Test user already exists');
            process.exit(0);
        }

        // Create test owner user
        const testUser = await User.create({
            name: 'Test Owner',
            email: 'owner@test.com',
            password: 'password123',
            role: 'pg_owner',
            ownerProfile: {
                companyName: 'Test PG Company'
            }
        });

        console.log('Test user created:', {
            id: testUser._id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser();