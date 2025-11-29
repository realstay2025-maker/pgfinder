// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateObjectId } = require('../utils/validation');

const protect = async (req, res, next) => {
    let token;

    // Check for token in the 'Authorization: Bearer <token>' header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header with validation
            const authParts = req.headers.authorization.split(' ');
            if (authParts.length !== 2) {
                return res.status(401).json({ message: 'Invalid authorization header format' });
            }
            token = authParts[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Validate user ID format
            if (!validateObjectId(decoded.id)) {
                return res.status(401).json({ message: 'Invalid token format' });
            }

            // Attach user (without password) and role to the request object
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'Token is valid but user no longer exists' });
            }
            
            // Check if user changed password after token was issued
            if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
                return res.status(401).json({ message: 'Password recently changed. Please log in again.' });
            }
            
            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            console.error('Auth middleware error:', error);
            return res.status(401).json({ message: 'Token verification failed' });
        }
    } else {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
};

// Middleware to restrict access based on user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            console.warn(`Unauthorized access attempt by user ${req.user._id} with role ${req.user.role}`);
            return res.status(403).json({ 
                message: 'Insufficient permissions to access this resource' 
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };