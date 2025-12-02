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
    updatePaymentStatus,
    getRoster,
    getKYC,
    updateKYC
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

// Roster Management
router.get('/roster', ownerProtect, getRoster);

// KYC Management
router.get('/kyc', ownerProtect, getKYC);
router.post('/kyc', ownerProtect, require('multer')({
    dest: 'uploads/kyc-documents/',
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'businessProof', maxCount: 1 }
]), updateKYC);



module.exports = router;