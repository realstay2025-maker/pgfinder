// server/models/OwnerPaymentAccount.js
const mongoose = require('mongoose');

const OwnerPaymentAccountSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // The ID provided by the payment gateway (e.g., RazorpayX Account ID, Stripe Connect ID)
    gatewayAccountId: { 
        type: String, 
        required: true,
        unique: true
    },
    bankDetails: {
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
    },
    status: {
        type: String, // e.g., 'active', 'pending_verification', 'rejected'
        default: 'pending_verification'
    }
}, { timestamps: true });

module.exports = mongoose.model('OwnerPaymentAccount', OwnerPaymentAccountSchema);