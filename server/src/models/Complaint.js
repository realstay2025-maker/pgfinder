// server/models/Complaint.js
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    tenantId: {
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
        ref: 'Room'
    },
    subject: {
        type: String,
        required: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Maintenance', 'Utility', 'Safety', 'Noise', 'Other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);