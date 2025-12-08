const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    filters: {
        location: {
            city: String,
            area: String,
            coordinates: {
                lat: Number,
                lng: Number
            },
            radius: { type: Number, default: 5 } // km
        },
        priceRange: {
            min: Number,
            max: Number
        },
        amenities: [String],
        roomType: String,
        gender: String,
        propertyType: String
    },
    alertsEnabled: {
        type: Boolean,
        default: true
    },
    lastNotified: Date
}, {
    timestamps: true
});

savedSearchSchema.index({ userId: 1 });
savedSearchSchema.index({ 'filters.location.coordinates': '2dsphere' });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);