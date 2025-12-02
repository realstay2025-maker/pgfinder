const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    noticeDate: {
        type: Date,
        default: Date.now
    },
    vacateDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revoked'],
        default: 'pending'
    },
    ownerResponse: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);