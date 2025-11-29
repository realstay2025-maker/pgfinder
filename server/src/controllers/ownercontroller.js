// server/controllers/owner.controller.js
const Property = require('../models/Property');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const ContactRequest = require('../models/ContactRequest');
const BookingRequest = require('../models/BookingRequest');
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { sendTenantCredentials } = require('../utils/emailService');

// @desc    OWNER: Get all key dashboard metrics and data for charts
// @route   GET /api/owner/dashboard-metrics
// @access  Private (PG Owner)
exports.getDashboardMetrics = async (req, res) => {
    try {
        const ownerId = req.user._id;

        // 1. Find all properties owned by the user
        const ownerProperties = await Property.find({ ownerId }).select('_id title');
        const propertyIds = ownerProperties.map(p => p._id);

        if (propertyIds.length === 0) {
            return res.status(200).json({
                stats: { 
                    totalProperties: 0, 
                    totalRooms: 0, 
                    totalCapacity: 0, 
                    totalOccupancy: 0, 
                    overallOccupancyRate: 0,
                    totalDues: 0 
                },
                occupancyData: []
            });
        }
        
        // --- 2. Aggregate Room and Occupancy Data ---
        const roomAggregation = await Room.aggregate([
            { $match: { propertyId: { $in: propertyIds } } },
            {
                $group: {
                    _id: '$propertyId',
                    totalRooms: { $count: {} },
                    totalCapacity: { $sum: '$capacity' },
                    totalOccupancy: { $sum: '$currentOccupancy' },
                    // Used for calculating occupancy rate per property
                    roomData: { $push: { roomNumber: '$roomNumber', occupancy: '$currentOccupancy', capacity: '$capacity' } }
                }
            }
        ]);

        let totalCapacity = 0;
        let totalOccupancy = 0;
        let totalRooms = 0;
        const occupancyData = roomAggregation.map(data => {
            const property = ownerProperties.find(p => p._id.equals(data._id));
            
            totalCapacity += data.totalCapacity;
            totalOccupancy += data.totalOccupancy;
            totalRooms += data.totalRooms;

            return {
                propertyId: data._id,
                propertyName: property ? property.title : 'Unknown Property',
                capacity: data.totalCapacity,
                occupancy: data.totalOccupancy,
                rate: data.totalCapacity > 0 ? ((data.totalOccupancy / data.totalCapacity) * 100).toFixed(1) : 0,
            };
        });
        
        // --- 3. Calculate Financial Dues (Outstanding Revenue) ---
        const duesAggregation = await Payment.aggregate([
            { 
                // Only consider non-paid dues (due, overdue, partial)
                $match: { 
                    propertyId: { $in: propertyIds },
                    status: { $in: ['due', 'overdue', 'partial'] }
                }
            },
            {
                $project: {
                    balance: { $subtract: ['$amountDue', '$amountPaid'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDues: { $sum: '$balance' }
                }
            }
        ]);
        
        const totalDues = duesAggregation.length > 0 ? duesAggregation[0].totalDues : 0;
        const totalProperties = ownerProperties.length;
        const overallOccupancyRate = totalCapacity > 0 ? ((totalOccupancy / totalCapacity) * 100).toFixed(1) : 0;

        res.status(200).json({
            stats: { 
                totalProperties, 
                totalRooms, 
                totalCapacity, 
                totalOccupancy,
                overallOccupancyRate,
                totalDues 
            },
            occupancyData
        });

    } catch (err) {
        console.error("Dashboard Metrics Error:", err);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics.', details: err.message });
    }
};

// Get contact requests for owner
exports.getContactRequests = async (req, res) => {
    try {
        const requests = await ContactRequest.find({ ownerId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contact requests' });
    }
};

// Get booking requests for owner
exports.getBookingRequests = async (req, res) => {
    try {
        const requests = await BookingRequest.find({ ownerId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch booking requests' });
    }
};

// Update contact request
exports.updateContactRequest = async (req, res) => {
    try {
        const { status, ownerResponse } = req.body;
        await ContactRequest.findByIdAndUpdate(req.params.id, { status, ownerResponse });
        res.json({ message: 'Contact request updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update contact request' });
    }
};

// Update booking request
exports.updateBookingRequest = async (req, res) => {
    try {
        const { status, ownerResponse } = req.body;
        await BookingRequest.findByIdAndUpdate(req.params.id, { status, ownerResponse });
        res.json({ message: 'Booking request updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update booking request' });
    }
};

// Get available tenants (those without room assignment)
exports.getAvailableTenants = async (req, res) => {
    try {
        const tenants = await User.find({ 
            role: 'tenant',
            'tenantProfile.roomId': { $exists: false }
        }).select('name email tenantProfile');
        res.json(tenants);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch available tenants' });
    }
};

// Assign tenant to room
exports.assignTenantToRoom = async (req, res) => {
    try {
        const { tenantId, roomId, checkInDate } = req.body;
        
        const tenant = await User.findById(tenantId);
        const room = await Room.findById(roomId);
        
        if (!tenant || !room) {
            return res.status(404).json({ error: 'Tenant or room not found' });
        }
        
        if (room.currentOccupancy >= room.capacity) {
            return res.status(400).json({ error: 'Room is at full capacity' });
        }
        
        // Update tenant profile with room assignment
        tenant.tenantProfile.roomId = roomId;
        tenant.tenantProfile.checkInDate = checkInDate;
        await tenant.save();
        
        // Update room occupancy
        room.currentOccupancy += 1;
        await room.save();
        
        res.json({ message: 'Tenant assigned to room successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to assign tenant to room' });
    }
};

// Convert booking to tenant
exports.convertBookingToTenant = async (req, res) => {
    try {
        const booking = await BookingRequest.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ email: booking.email });
        let tenantUser;
        let password = null;

        if (existingUser) {
            // Update existing user to tenant role
            existingUser.role = 'tenant';
            existingUser.tenantProfile = {
                phone: booking.phone,
                pgName: booking.propertyTitle,
                profileCompleted: false
            };
            tenantUser = await existingUser.save();
        } else {
            // Generate random password for new user
            password = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new tenant user account
            tenantUser = new User({
                name: booking.name,
                email: booking.email,
                password: hashedPassword,
                role: 'tenant',
                tenantProfile: {
                    phone: booking.phone,
                    pgName: booking.propertyTitle,
                    profileCompleted: false
                }
            });
            
            await tenantUser.save();
            
            // Send email with credentials only for new users
            try {
                await sendTenantCredentials(booking.email, booking.name, password);
            } catch (emailError) {
                console.log('Email sending failed (non-critical):', emailError.message);
            }
        }
        
        // Update booking status
        booking.status = 'converted';
        booking.tenantUserId = tenantUser._id;
        await booking.save();
        
        res.json({ 
            message: existingUser ? 'Booking approved - existing user updated' : 'Booking approved and credentials sent', 
            email: booking.email,
            tenantId: tenantUser._id 
        });
    } catch (err) {
        console.error('Convert booking error:', err);
        res.status(500).json({ error: 'Failed to convert booking' });
    }
};