const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  type: {
    type: String,
    enum: ['revenue', 'occupancy', 'tenant_behavior', 'property_performance'],
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    revenue: {
      total: { type: Number, default: 0 },
      collected: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 }
    },
    occupancy: {
      totalRooms: { type: Number, default: 0 },
      occupiedRooms: { type: Number, default: 0 },
      vacantRooms: { type: Number, default: 0 },
      occupancyRate: { type: Number, default: 0 }
    },
    tenantBehavior: {
      newTenants: { type: Number, default: 0 },
      exitedTenants: { type: Number, default: 0 },
      complaints: { type: Number, default: 0 },
      notices: { type: Number, default: 0 },
      avgStayDuration: { type: Number, default: 0 }
    },
    propertyPerformance: {
      bookingRequests: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

analyticsSchema.index({ ownerId: 1, type: 1, period: 1, date: -1 });
analyticsSchema.index({ propertyId: 1, type: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);