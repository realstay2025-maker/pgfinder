// server/routes/admin.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getAllUsers, deleteUser, getAdminStats, getSubscriptions, updateSubscriptionStatus, getSubscriptionHistory, toggleListing } = require('../controllers/admincontroller');
const router = express.Router();

const adminProtect = [protect, authorizeRoles('admin', 'super_admin')];

router.get('/users', adminProtect, getAllUsers);
router.delete('/users/:id', adminProtect, deleteUser);
router.get('/stats', adminProtect, getAdminStats);
router.get('/subscriptions', adminProtect, getSubscriptions);
router.put('/subscriptions/:id', adminProtect, updateSubscriptionStatus);
router.get('/subscription-history/:ownerId', adminProtect, getSubscriptionHistory);
router.put('/users/:id/listing', adminProtect, toggleListing);

module.exports = router;