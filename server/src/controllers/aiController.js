const {
  ChatbotService,
  SmartPricingService,
  PredictiveAnalyticsService,
  TenantScreeningService,
  ContentModerationService
} = require('../utils/aiServices');

// Chatbot endpoints
const chatbotMessage = async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;
    const userId = req.user?.id;

    const response = await ChatbotService.processMessage(sessionId, message, userId, context);
    
    res.json({
      success: true,
      response: response.content,
      intent: response.intent,
      confidence: response.confidence
    });
  } catch (error) {
    res.status(500).json({ message: 'Chatbot service error', error: error.message });
  }
};

// Smart pricing endpoints
const getPricingRecommendation = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const recommendation = await SmartPricingService.generatePricingRecommendation(propertyId);
    
    res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    res.status(500).json({ message: 'Pricing service error', error: error.message });
  }
};

// Predictive analytics endpoints
const getOccupancyForecast = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { timeframe = 'monthly' } = req.query;
    
    const forecast = await PredictiveAnalyticsService.generateOccupancyForecast(propertyId, timeframe);
    
    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    res.status(500).json({ message: 'Forecasting service error', error: error.message });
  }
};

const getRevenueForecast = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { timeframe = 'monthly' } = req.query;
    
    const forecast = await PredictiveAnalyticsService.generateRevenueForecast(propertyId, timeframe);
    
    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    res.status(500).json({ message: 'Forecasting service error', error: error.message });
  }
};

// Tenant screening endpoints
const screenTenant = async (req, res) => {
  try {
    const tenantData = req.body;
    const screening = await TenantScreeningService.screenTenant(tenantData);
    
    res.json({
      success: true,
      screening
    });
  } catch (error) {
    res.status(500).json({ message: 'Screening service error', error: error.message });
  }
};

// Content moderation endpoints
const moderateContent = async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    const moderation = await ContentModerationService.moderateContent(content, type);
    
    res.json({
      success: true,
      moderation
    });
  } catch (error) {
    res.status(500).json({ message: 'Moderation service error', error: error.message });
  }
};

// Smart maintenance prediction
const predictMaintenance = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Simulate maintenance prediction
    const predictions = [
      {
        item: 'Air Conditioning',
        probability: 0.75,
        timeframe: '2-3 months',
        estimatedCost: 15000,
        priority: 'Medium'
      },
      {
        item: 'Plumbing',
        probability: 0.45,
        timeframe: '4-6 months',
        estimatedCost: 8000,
        priority: 'Low'
      },
      {
        item: 'Electrical',
        probability: 0.30,
        timeframe: '6-8 months',
        estimatedCost: 12000,
        priority: 'Low'
      }
    ];

    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    res.status(500).json({ message: 'Maintenance prediction error', error: error.message });
  }
};

module.exports = {
  chatbotMessage,
  getPricingRecommendation,
  getOccupancyForecast,
  getRevenueForecast,
  screenTenant,
  moderateContent,
  predictMaintenance
};