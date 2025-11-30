// server/routes/owner.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { 
    getDashboardMetrics,
    getContactRequests,
    getBookingRequests,
    updateContactRequest,
    updateBookingRequest,
    convertBookingToTenant,
    getAvailableTenants,
    assignTenantToRoom,
    removeTenantFromRoom,
    getTenantsWithPayments,
    sendPaymentReminder,
    updatePaymentStatus
} = require('../controllers/ownercontroller');

const router = express.Router();

const ownerProtect = [protect, authorizeRoles('pg_owner')];

// Dashboard
router.get('/dashboard-metrics', ownerProtect, getDashboardMetrics);

// Requests Management
router.get('/contact-requests', ownerProtect, getContactRequests);
router.get('/booking-requests', ownerProtect, getBookingRequests);
router.put('/contact-requests/:id', ownerProtect, updateContactRequest);
router.put('/booking-requests/:id', ownerProtect, updateBookingRequest);
router.post('/booking-requests/:id/convert', ownerProtect, convertBookingToTenant);

// Tenant Management
router.get('/available-tenants', ownerProtect, getAvailableTenants);
router.post('/assign-tenant-room', ownerProtect, assignTenantToRoom);
router.post('/remove-tenant', ownerProtect, removeTenantFromRoom);

// Payment Management
router.get('/tenants-payments', ownerProtect, getTenantsWithPayments);
router.post('/send-reminder/:tenantId', ownerProtect, sendPaymentReminder);
router.put('/payment-status/:tenantId', ownerProtect, updatePaymentStatus);



module.exports = router;