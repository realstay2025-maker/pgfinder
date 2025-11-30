// server/models/Tenant.js
const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    bedId: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    emergencyContact: {
        type: String
    },
    occupation: {
        type: String
    },
    rent: {
        type: Number
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    moveOutDate: {
        type: Date
    },
    profileCompletedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['profile_incomplete', 'profile_completed', 'active', 'notice', 'moved_out'],
        default: 'profile_incomplete'
    },
    // History tracking
    rentHistory: [{
        amount: Number,
        effectiveDate: Date,
        reason: String
    }],
    statusHistory: [{
        status: String,
        date: Date,
        reason: String
    }]
}, { timestamps: true });

// Index for efficient queries
TenantSchema.index({ propertyId: 1, status: 1 });
TenantSchema.index({ roomId: 1, status: 1 });

module.exports = mongoose.model('Tenant', TenantSchema);