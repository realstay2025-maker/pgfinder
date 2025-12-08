const mongoose = require('mongoose');

const chatbotConversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: String,
    confidence: Number
  }],
  context: {
    userType: String,
    currentPage: String,
    propertyId: String,
    lastAction: String
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'escalated'],
    default: 'active'
  },
  satisfaction: {
    rating: Number,
    feedback: String
  }
}, {
  timestamps: true
});

chatbotConversationSchema.index({ sessionId: 1 });
chatbotConversationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);