// server/models/Property.js
const mongoose = require('mongoose');

// Define the schema for available room types within this property
const RoomTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['single', 'double', 'triple', 'quad'],
        required: true,
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    availableCount: { 
        type: Number,
        default: 0
    },
    occupiedBeds: {
        type: Number,
        default: 0
    }
});


const PropertySchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    pgType: {
        type: String,
        enum: ['boys', 'girls', 'unisex'],
        required: true,
    },
    floorCount: {
        type: Number,
        required: true,
        min: 1,
    },
    roomsPerFloor: {
        type: Number,
        required: true,
        min: 1,
    },
    address: {
        line1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    amenities: [{
        type: String,
        enum: ['wifi', 'ac', 'parking', 'laundry', 'kitchen', 'gym', 'security', 'power_backup', 'water_supply', 'cleaning']
    }],
    nearbyServices: {
        hospitals: [{
            name: String,
            distance: Number, // in km
            type: String
        }],
        schools: [{
            name: String,
            distance: Number,
            type: String
        }],
        transport: [{
            name: String,
            distance: Number,
            type: String // bus_stop, metro, railway
        }],
        shopping: [{
            name: String,
            distance: Number,
            type: String
        }]
    },
    images: [{
        type: String, 
    }],
    // NEW: Array to hold different room sharing options
    roomTypes: [RoomTypeSchema], 
    
    totalRooms: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);