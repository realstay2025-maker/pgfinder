const ChatbotConversation = require('../models/ChatbotConversation');
const PredictiveAnalytics = require('../models/PredictiveAnalytics');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');

// Chatbot Service
class ChatbotService {
  static async processMessage(sessionId, message, userId = null, context = {}) {
    try {
      let conversation = await ChatbotConversation.findOne({ sessionId });
      
      if (!conversation) {
        conversation = new ChatbotConversation({
          sessionId,
          userId,
          messages: [],
          context
        });
      }

      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message,
        intent: this.detectIntent(message),
        confidence: 0.8
      });

      // Generate AI response
      const response = await this.generateResponse(message, conversation.context);
      
      conversation.messages.push({
        role: 'assistant',
        content: response.content,
        intent: response.intent,
        confidence: response.confidence
      });

      await conversation.save();
      return response;
    } catch (error) {
      return {
        content: "I'm sorry, I'm having trouble processing your request. Please try again or contact support.",
        intent: 'error',
        confidence: 1.0
      };
    }
  }

  static detectIntent(message) {
    const intents = {
      'booking': ['book', 'reserve', 'availability', 'room'],
      'pricing': ['price', 'cost', 'rent', 'fee', 'payment'],
      'location': ['location', 'address', 'near', 'distance'],
      'amenities': ['amenities', 'facilities', 'wifi', 'parking'],
      'complaint': ['problem', 'issue', 'complaint', 'broken'],
      'support': ['help', 'support', 'contact', 'assistance']
    };

    const lowerMessage = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  }

  static async generateResponse(message, context) {
    const intent = this.detectIntent(message);
    
    const responses = {
      booking: "I can help you with booking! Let me check available rooms. What's your preferred move-in date and budget?",
      pricing: "Our PG prices vary by location and room type. Typically ranging from ₹8,000 to ₹25,000 per month. Would you like specific pricing for a property?",
      location: "We have PGs in multiple locations. Which area are you looking for? I can show you properties near metro stations, IT hubs, or colleges.",
      amenities: "Our PGs offer various amenities like WiFi, AC, parking, laundry, and more. Are you looking for any specific facilities?",
      complaint: "I understand you have an issue. For immediate assistance, I can help you submit a complaint or connect you with our support team.",
      support: "I'm here to help! You can ask me about bookings, pricing, locations, amenities, or any other questions about our PG services.",
      general: "Thank you for your message! I can help you with PG bookings, pricing information, locations, and amenities. What would you like to know?"
    };

    return {
      content: responses[intent] || responses.general,
      intent,
      confidence: 0.85
    };
  }
}

// Smart Pricing Service
class SmartPricingService {
  static async generatePricingRecommendation(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Analyze market factors
      const marketData = await this.analyzeMarketFactors(property);
      const occupancyRate = await this.calculateOccupancyRate(propertyId);
      const seasonalFactor = this.getSeasonalFactor();

      // Calculate recommended price
      const basePrice = property.basePrice || 10000;
      let recommendedPrice = basePrice;

      // Apply market adjustments
      if (marketData.demandLevel === 'high') recommendedPrice *= 1.15;
      if (marketData.demandLevel === 'low') recommendedPrice *= 0.9;

      // Apply occupancy adjustments
      if (occupancyRate < 0.7) recommendedPrice *= 0.95;
      if (occupancyRate > 0.9) recommendedPrice *= 1.1;

      // Apply seasonal adjustments
      recommendedPrice *= seasonalFactor;

      return {
        currentPrice: basePrice,
        recommendedPrice: Math.round(recommendedPrice),
        factors: {
          marketDemand: marketData.demandLevel,
          occupancyRate: occupancyRate,
          seasonalFactor: seasonalFactor,
          competitorPricing: marketData.avgPrice
        },
        confidence: 0.78
      };
    } catch (error) {
      throw new Error('Failed to generate pricing recommendation');
    }
  }

  static async analyzeMarketFactors(property) {
    // Simulate market analysis
    const nearbyProperties = await Property.find({
      'address.city': property.address.city,
      _id: { $ne: property._id }
    }).limit(10);

    const avgPrice = nearbyProperties.reduce((sum, p) => sum + (p.basePrice || 0), 0) / nearbyProperties.length;
    
    return {
      avgPrice: avgPrice || 12000,
      demandLevel: Math.random() > 0.5 ? 'high' : 'medium',
      competitorCount: nearbyProperties.length
    };
  }

  static async calculateOccupancyRate(propertyId) {
    // Simulate occupancy calculation
    return Math.random() * 0.4 + 0.6; // 60-100%
  }

  static getSeasonalFactor() {
    const month = new Date().getMonth();
    // Higher demand in June-August (college admissions)
    if (month >= 5 && month <= 7) return 1.1;
    // Lower demand in winter months
    if (month >= 11 || month <= 1) return 0.95;
    return 1.0;
  }
}

// Predictive Analytics Service
class PredictiveAnalyticsService {
  static async generateOccupancyForecast(propertyId, timeframe = 'monthly') {
    try {
      const property = await Property.findById(propertyId);
      const historicalData = await this.getHistoricalOccupancy(propertyId);
      
      const predictions = [];
      const periods = timeframe === 'monthly' ? 12 : 4;
      
      for (let i = 1; i <= periods; i++) {
        const prediction = this.calculateOccupancyPrediction(historicalData, i);
        predictions.push({
          period: this.getPeriodLabel(i, timeframe),
          value: prediction.value,
          confidence: prediction.confidence,
          factors: ['seasonal_trends', 'market_demand', 'pricing_strategy']
        });
      }

      return await PredictiveAnalytics.findOneAndUpdate(
        { propertyId, predictionType: 'occupancy', timeframe },
        {
          propertyId,
          ownerId: property.ownerId,
          predictionType: 'occupancy',
          timeframe,
          predictions,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      throw new Error('Failed to generate occupancy forecast');
    }
  }

  static async generateRevenueForecast(propertyId, timeframe = 'monthly') {
    try {
      const property = await Property.findById(propertyId);
      const historicalRevenue = await this.getHistoricalRevenue(propertyId);
      
      const predictions = [];
      const periods = timeframe === 'monthly' ? 12 : 4;
      
      for (let i = 1; i <= periods; i++) {
        const prediction = this.calculateRevenuePrediction(historicalRevenue, i);
        predictions.push({
          period: this.getPeriodLabel(i, timeframe),
          value: prediction.value,
          confidence: prediction.confidence,
          factors: ['occupancy_rate', 'pricing_changes', 'market_trends']
        });
      }

      return await PredictiveAnalytics.findOneAndUpdate(
        { propertyId, predictionType: 'revenue', timeframe },
        {
          propertyId,
          ownerId: property.ownerId,
          predictionType: 'revenue',
          timeframe,
          predictions,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      throw new Error('Failed to generate revenue forecast');
    }
  }

  static async getHistoricalOccupancy(propertyId) {
    // Simulate historical data
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      occupancyRate: Math.random() * 0.3 + 0.7
    }));
  }

  static async getHistoricalRevenue(propertyId) {
    // Simulate historical revenue data
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: Math.random() * 50000 + 100000
    }));
  }

  static calculateOccupancyPrediction(historicalData, periodAhead) {
    const trend = this.calculateTrend(historicalData.map(d => d.occupancyRate));
    const seasonal = this.getSeasonalAdjustment(periodAhead);
    const baseValue = historicalData[historicalData.length - 1].occupancyRate;
    
    return {
      value: Math.min(0.95, Math.max(0.5, baseValue + trend + seasonal)),
      confidence: Math.max(0.6, 0.9 - (periodAhead * 0.05))
    };
  }

  static calculateRevenuePrediction(historicalData, periodAhead) {
    const trend = this.calculateTrend(historicalData.map(d => d.revenue));
    const seasonal = this.getSeasonalAdjustment(periodAhead) * 10000;
    const baseValue = historicalData[historicalData.length - 1].revenue;
    
    return {
      value: Math.max(50000, baseValue + trend + seasonal),
      confidence: Math.max(0.6, 0.9 - (periodAhead * 0.05))
    };
  }

  static calculateTrend(values) {
    if (values.length < 2) return 0;
    const recent = values.slice(-3);
    return (recent[recent.length - 1] - recent[0]) / recent.length;
  }

  static getSeasonalAdjustment(periodAhead) {
    const month = (new Date().getMonth() + periodAhead) % 12;
    if (month >= 5 && month <= 7) return 0.1; // Summer boost
    if (month >= 11 || month <= 1) return -0.05; // Winter dip
    return 0;
  }

  static getPeriodLabel(period, timeframe) {
    const now = new Date();
    if (timeframe === 'monthly') {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + period, 1);
      return futureDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } else {
      const quarter = Math.ceil((now.getMonth() + 1 + period * 3) / 3);
      const year = now.getFullYear() + Math.floor((now.getMonth() + period * 3) / 12);
      return `Q${quarter} ${year}`;
    }
  }
}

// Automated Tenant Screening Service
class TenantScreeningService {
  static async screenTenant(tenantData) {
    try {
      const score = await this.calculateTenantScore(tenantData);
      const riskFactors = this.identifyRiskFactors(tenantData);
      const recommendation = this.generateRecommendation(score, riskFactors);

      return {
        score,
        riskLevel: this.getRiskLevel(score),
        riskFactors,
        recommendation,
        confidence: 0.82
      };
    } catch (error) {
      throw new Error('Failed to screen tenant');
    }
  }

  static async calculateTenantScore(tenantData) {
    let score = 100;

    // Income verification (30 points)
    if (tenantData.monthlyIncome) {
      const incomeRatio = tenantData.monthlyIncome / (tenantData.expectedRent || 10000);
      if (incomeRatio >= 3) score += 30;
      else if (incomeRatio >= 2) score += 20;
      else if (incomeRatio >= 1.5) score += 10;
      else score -= 20;
    }

    // Employment status (25 points)
    if (tenantData.employmentType === 'permanent') score += 25;
    else if (tenantData.employmentType === 'contract') score += 15;
    else if (tenantData.employmentType === 'student') score += 10;

    // Credit history simulation (20 points)
    const creditScore = Math.random() * 40 + 60; // 60-100
    score += (creditScore - 60);

    // References (15 points)
    if (tenantData.references && tenantData.references.length >= 2) score += 15;
    else if (tenantData.references && tenantData.references.length === 1) score += 8;

    // Background check simulation (10 points)
    if (Math.random() > 0.1) score += 10; // 90% pass rate

    return Math.max(0, Math.min(200, score));
  }

  static identifyRiskFactors(tenantData) {
    const factors = [];

    if (!tenantData.monthlyIncome || tenantData.monthlyIncome < (tenantData.expectedRent * 2)) {
      factors.push('Low income to rent ratio');
    }

    if (tenantData.employmentType === 'unemployed') {
      factors.push('Unemployed status');
    }

    if (!tenantData.references || tenantData.references.length === 0) {
      factors.push('No references provided');
    }

    if (tenantData.age && tenantData.age < 21) {
      factors.push('Young age - limited rental history');
    }

    return factors;
  }

  static generateRecommendation(score, riskFactors) {
    if (score >= 150) return 'Highly Recommended - Excellent tenant profile';
    if (score >= 120) return 'Recommended - Good tenant with minor considerations';
    if (score >= 90) return 'Conditional Approval - Require additional security deposit';
    if (score >= 60) return 'High Risk - Require guarantor and advance rent';
    return 'Not Recommended - Multiple risk factors identified';
  }

  static getRiskLevel(score) {
    if (score >= 150) return 'Low';
    if (score >= 120) return 'Medium-Low';
    if (score >= 90) return 'Medium';
    if (score >= 60) return 'Medium-High';
    return 'High';
  }
}

// Content Moderation Service
class ContentModerationService {
  static async moderateContent(content, type = 'text') {
    try {
      const analysis = await this.analyzeContent(content, type);
      const action = this.determineAction(analysis);

      return {
        isApproved: action === 'approve',
        confidence: analysis.confidence,
        flags: analysis.flags,
        action,
        reason: analysis.reason
      };
    } catch (error) {
      return {
        isApproved: false,
        confidence: 0.5,
        flags: ['error'],
        action: 'review',
        reason: 'Content moderation service error'
      };
    }
  }

  static async analyzeContent(content, type) {
    const flags = [];
    let confidence = 0.9;

    // Profanity detection
    const profanityWords = ['spam', 'fake', 'scam', 'fraud'];
    if (profanityWords.some(word => content.toLowerCase().includes(word))) {
      flags.push('inappropriate_language');
    }

    // Spam detection
    if (this.detectSpam(content)) {
      flags.push('potential_spam');
    }

    // Personal information detection
    if (this.detectPersonalInfo(content)) {
      flags.push('personal_information');
    }

    return {
      flags,
      confidence,
      reason: flags.length > 0 ? `Flagged for: ${flags.join(', ')}` : 'Content approved'
    };
  }

  static detectSpam(content) {
    const spamIndicators = ['call now', 'limited time', 'act fast', 'guaranteed'];
    return spamIndicators.some(indicator => content.toLowerCase().includes(indicator));
  }

  static detectPersonalInfo(content) {
    const phoneRegex = /\b\d{10}\b/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    return phoneRegex.test(content) || emailRegex.test(content);
  }

  static determineAction(analysis) {
    if (analysis.flags.length === 0) return 'approve';
    if (analysis.flags.includes('inappropriate_language')) return 'reject';
    if (analysis.flags.includes('potential_spam')) return 'review';
    return 'approve';
  }
}

module.exports = {
  ChatbotService,
  SmartPricingService,
  PredictiveAnalyticsService,
  TenantScreeningService,
  ContentModerationService
};