const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
    submitNotice,
    getTenantNotices,
    getOwnerNotices,
    updateNoticeStatus,
    revokeNotice
} = require('../controllers/noticecontroller');

const router = express.Router();

// Tenant routes
router.post('/submit', protect, authorizeRoles('tenant'), submitNotice);
router.get('/tenant', protect, authorizeRoles('tenant'), getTenantNotices);
router.put('/:id/revoke', protect, authorizeRoles('tenant'), revokeNotice);

// Owner routes
router.get('/owner', protect, authorizeRoles('pg_owner'), getOwnerNotices);
router.put('/:id/status', protect, authorizeRoles('pg_owner'), updateNoticeStatus);

module.exports = router;