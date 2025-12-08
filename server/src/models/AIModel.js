const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['chatbot', 'pricing', 'screening', 'maintenance', 'moderation'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  performance: {
    accuracy: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIModel', aiModelSchema);