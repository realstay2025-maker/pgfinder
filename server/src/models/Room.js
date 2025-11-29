// server/models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        enum: ['single', 'double', 'triple', 'quad'],
        required: true
    },
    maxBeds: {
        type: Number,
        required: true
    },
    occupiedBeds: {
        type: Number,
        default: 0
    },
    basePrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['empty', 'partial', 'full'],
        default: 'empty'
    },
    tenants: [{
        bedId: { type: String, required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        phone: { type: String },
        email: { type: String },
        joinDate: { type: Date, default: Date.now },
        rent: { type: Number },
        status: { type: String, enum: ['active', 'notice', 'moved_out'], default: 'active' }
    }]
}, { timestamps: true });

// Index for efficient queries
RoomSchema.index({ propertyId: 1, roomNumber: 1 });

module.exports = mongoose.model('Room', RoomSchema);