// server/routes/auth.js
const express = require('express');
const { registerUser, loginUser, promoteToAdmin, changePassword } = require('../controllers/authcontroller');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  logout, 
  getSessions, 
  revokeSession 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const sessionManager = require('../middleware/sessionManager');
const auditLogger = require('../middleware/auditLogger');
const { authLimiter, passwordLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Public routes for login and signup (with rate limiting)
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/promote-admin', authLimiter, promoteToAdmin);

// Enhanced security routes
router.post('/forgot-password', authLimiter, auditLogger('forgot_password', 'user'), forgotPassword);
router.post('/reset-password', authLimiter, auditLogger('reset_password', 'user'), resetPassword);
router.post('/logout', sessionManager, auditLogger('logout', 'user'), logout);
router.get('/sessions', sessionManager, getSessions);
router.delete('/sessions/:sessionId', sessionManager, auditLogger('revoke_session', 'session'), revokeSession);

// Protected routes
router.put('/change-password', passwordLimiter, protect, changePassword);

module.exports = router;