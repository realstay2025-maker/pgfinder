// server/models/Tenant.js
const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    bedId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    rent: {
        type: Number,
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    moveOutDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'notice', 'moved_out'],
        default: 'active'
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