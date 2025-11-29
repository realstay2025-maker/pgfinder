// server/routes/auth.js
const express = require('express');
const { registerUser, loginUser, promoteToAdmin, changePassword } = require('../controllers/authcontroller');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Public routes for login and signup (with rate limiting)
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/promote-admin', authLimiter, promoteToAdmin);

// Protected routes
router.put('/change-password', passwordLimiter, protect, changePassword);

module.exports = router;