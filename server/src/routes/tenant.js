// server/routes/tenant.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { updateTenantProfile, getTenantProfile, getAvailableProperties, getTenantLeaseInfo } = require('../controllers/tenantController');
const router = express.Router();

const tenantProtect = [protect, authorizeRoles('tenant')];

router.get('/profile', tenantProtect, getTenantProfile);
router.put('/profile', tenantProtect, updateTenantProfile);
router.get('/available-properties', tenantProtect, getAvailableProperties);
router.get('/my-lease-info', tenantProtect, getTenantLeaseInfo);

module.exports = router;