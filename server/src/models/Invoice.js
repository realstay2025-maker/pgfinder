const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['generated', 'downloaded'],
        default: 'generated'
    }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);