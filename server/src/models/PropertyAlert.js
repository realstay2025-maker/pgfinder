const mongoose = require('mongoose');

const propertyAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    alertType: {
        type: String,
        enum: ['new_listing', 'price_drop', 'availability'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

propertyAlertSchema.index({ userId: 1, isRead: 1 });
propertyAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PropertyAlert', propertyAlertSchema);