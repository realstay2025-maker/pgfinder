const mongoose = require('mongoose');

const predictiveAnalyticsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  predictionType: {
    type: String,
    enum: ['occupancy', 'revenue', 'maintenance', 'pricing'],
    required: true
  },
  timeframe: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  predictions: [{
    period: String,
    value: Number,
    confidence: Number,
    factors: [String]
  }],
  actualValues: [{
    period: String,
    value: Number
  }],
  accuracy: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

predictiveAnalyticsSchema.index({ propertyId: 1, predictionType: 1 });
predictiveAnalyticsSchema.index({ ownerId: 1, lastUpdated: -1 });

module.exports = mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema);