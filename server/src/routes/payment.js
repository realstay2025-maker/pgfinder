// server/routes/payment.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getTenantPayments, getOwnerPaymentSummary } = require('../controllers/paymentController');
const router = express.Router();

const ownerProtect = [protect, authorizeRoles('pg_owner')];
const tenantProtect = [protect, authorizeRoles('tenant')];

router.get('/tenant/my-payments', tenantProtect, getTenantPayments);
router.get('/owner/summary', ownerProtect, getOwnerPaymentSummary);

module.exports = router;