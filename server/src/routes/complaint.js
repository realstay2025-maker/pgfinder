// server/routes/complaint.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { 
    submitComplaint,
    getOwnerComplaints,
    updateComplaintStatus,
    getTenantComplaints
} = require('../controllers/complaintcontroller'); 

const router = express.Router();

const ownerProtect = [protect, authorizeRoles('pg_owner')];
const tenantProtect = [protect, authorizeRoles('tenant')];


// TENANT ROUTES
router.post('/', tenantProtect, submitComplaint);
router.get('/tenant/my-complaints', tenantProtect, getTenantComplaints);

// OWNER ROUTES
router.get('/owner/all', ownerProtect, getOwnerComplaints);
router.get('/owner', ownerProtect, getOwnerComplaints);
router.put('/:id/status', ownerProtect, updateComplaintStatus);
module.exports = router;