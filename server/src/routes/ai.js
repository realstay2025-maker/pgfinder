const express = require('express');
const {
  chatbotMessage,
  getPricingRecommendation,
  getOccupancyForecast,
  getRevenueForecast,
  screenTenant,
  moderateContent,
  predictMaintenance
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Public chatbot endpoint (no auth required)
router.post('/chatbot', auditLogger('chatbot_interaction', 'ai'), chatbotMessage);

// Protected AI endpoints
router.use(protect);

// Smart pricing
router.get('/pricing/:propertyId', auditLogger('ai_pricing', 'ai'), getPricingRecommendation);

// Predictive analytics
router.get('/forecast/occupancy/:propertyId', auditLogger('ai_occupancy_forecast', 'ai'), getOccupancyForecast);
router.get('/forecast/revenue/:propertyId', auditLogger('ai_revenue_forecast', 'ai'), getRevenueForecast);

// Tenant screening
router.post('/screen-tenant', auditLogger('ai_tenant_screening', 'ai'), screenTenant);

// Content moderation
router.post('/moderate', auditLogger('ai_content_moderation', 'ai'), moderateContent);

// Smart maintenance
router.get('/maintenance/:propertyId', auditLogger('ai_maintenance_prediction', 'ai'), predictMaintenance);

module.exports = router;