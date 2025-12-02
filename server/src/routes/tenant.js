const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getTenantInvoices, generateInvoicePDF, getTenantProfile, updateTenantProfile, getTenantProfileForOwner } = require('../controllers/tenantcontroller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/tenant-documents');
        require('fs').mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'aadhaarCard') {
            // Allow images and PDFs for Aadhaar
            if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Aadhaar card must be an image or PDF file'));
            }
        } else if (file.fieldname === 'photo') {
            // Allow only images for photo
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Photo must be an image file'));
            }
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});

const router = express.Router();
const tenantProtect = [protect, authorizeRoles('tenant')];

// Profile routes
router.get('/profile', tenantProtect, getTenantProfile);
router.put('/profile', tenantProtect, upload.fields([
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), updateTenantProfile);

// Owner access to tenant profiles
router.get('/profile/:tenantId/owner', [protect, authorizeRoles('pg_owner')], getTenantProfileForOwner);

// Invoice routes
router.get('/invoices', tenantProtect, getTenantInvoices);
router.get('/invoice/:invoiceId/pdf', tenantProtect, generateInvoicePDF);

module.exports = router;