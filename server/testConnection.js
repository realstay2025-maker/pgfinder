require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const testConnection = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Create test user
        const existingUser = await User.findOne({ email: 'test@owner.com' });
        if (!existingUser) {
            const testUser = await User.create({
                name: 'Test Owner',
                email: 'test@owner.com',
                password: 'test123',
                role: 'pg_owner'
            });
            console.log('✅ Test user created:', testUser.email);
        } else {
            console.log('✅ Test user exists:', existingUser.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testConnection();