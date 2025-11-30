// server/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validatePassword, sanitizeInput, validateEmail } = require('../utils/validation');

// Helper function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, pgName } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ message: passwordErrors.join(', ') });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = email.toLowerCase().trim();
        
        // Set default profiles based on role
        const ownerProfile = role === 'pg_owner' ? { companyName: `${sanitizedName}'s PGs` } : undefined;
        
        // Default role is 'pg_owner' if not specified or invalid
        const userRole = ['super_admin', 'admin', 'pg_owner', 'tenant'].includes(role) ? role : 'pg_owner';

        const user = await User.create({
            name: sanitizedName,
            email: sanitizedEmail,
            password,
            role: userRole,
            ownerProfile
        });
        
        // If tenant registration, create initial Tenant record with PG selection
        if (role === 'tenant' && pgName) {
            const Tenant = require('../models/Tenant');
            const Property = require('../models/Property');
            
            const property = await Property.findOne({ title: pgName });
            await Tenant.create({
                name: sanitizedName,
                email: sanitizedEmail,
                userId: user._id,
                propertyId: property?._id,
                ownerId: property?.ownerId,
                status: 'profile_incomplete'
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Promote user to admin (temporary for testing)
// @route   POST /api/auth/promote-admin
exports.promoteToAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Input validation
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        // Sanitize email input
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        const user = await User.findOne({ email: sanitizedEmail });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.role = 'admin';
        await user.save();
        
        res.json({ message: 'User promoted to admin successfully', user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Promote admin error:', err);
        res.status(500).json({ message: 'Failed to promote user' });
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Input validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }

        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ error: passwordErrors.join(', ') });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }
        
        // Set new password (User model will handle hashing)
        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

  