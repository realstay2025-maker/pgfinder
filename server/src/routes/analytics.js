const express = require('express');
const {
  getDashboardMetrics,
  getRevenueReport,
  getOccupancyReport,
  getTenantBehaviorReport,
  exportReport,
  getCustomReport
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard metrics
router.get('/dashboard', auditLogger('view_analytics', 'analytics'), getDashboardMetrics);

// Specific reports
router.get('/revenue', auditLogger('view_revenue_report', 'analytics'), getRevenueReport);
router.get('/occupancy', auditLogger('view_occupancy_report', 'analytics'), getOccupancyReport);
router.get('/tenant-behavior', auditLogger('view_tenant_behavior_report', 'analytics'), getTenantBehaviorReport);

// Export functionality
router.get('/export', auditLogger('export_report', 'analytics'), exportReport);

// Custom report builder
router.post('/custom', auditLogger('create_custom_report', 'analytics'), getCustomReport);

module.exports = router;