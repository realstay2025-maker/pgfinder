const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getTenantInvoices, generateInvoicePDF } = require('../controllers/tenantcontroller');

const router = express.Router();
const tenantProtect = [protect, authorizeRoles('tenant')];

// Invoice routes
router.get('/invoices', tenantProtect, getTenantInvoices);
router.get('/invoice/:invoiceId/pdf', tenantProtect, generateInvoicePDF);

module.exports = router;