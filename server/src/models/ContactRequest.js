const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyTitle: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'contacted', 'closed'], default: 'pending' },
    ownerResponse: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);