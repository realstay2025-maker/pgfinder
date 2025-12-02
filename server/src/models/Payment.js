// server/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    amountDue: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi', 'card'],
        default: 'cash'
    },
    transactionId: {
        type: String
    },
    notes: {
        type: String
    },
    paymentMonth: {
        type: String // Format: YYYY-MM
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate payments for same tenant in same month
PaymentSchema.index({ tenantId: 1, paymentMonth: 1 }, { unique: true });

module.exports = mongoose.model('Payment', PaymentSchema);