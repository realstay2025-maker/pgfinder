// server/routes/admin.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getAllUsers, deleteUser, getAdminStats } = require('../controllers/admincontroller');
const router = express.Router();

const adminProtect = [protect, authorizeRoles('admin', 'super_admin')];

router.get('/users', adminProtect, getAllUsers);
router.delete('/users/:id', adminProtect, deleteUser);
router.get('/stats', adminProtect, getAdminStats);

module.exports = router;