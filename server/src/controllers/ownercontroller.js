// server/controllers/owner.controller.js
const Property = require('../models/Property');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const ContactRequest = require('../models/ContactRequest');
const BookingRequest = require('../models/BookingRequest');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { sendTenantCredentials, sendPaymentReminder } = require('../utils/emailService');

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
                    totalCapacity: { $sum: '$maxBeds' },
                    totalOccupancy: { $sum: '$occupiedBeds' },
                    // Used for calculating occupancy rate per property
                    roomData: { $push: { roomNumber: '$roomNumber', occupancy: '$occupiedBeds', capacity: '$maxBeds' } }
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
        // Get owner's properties
        const ownerProperties = await Property.find({ ownerId: req.user._id }).select('_id');
        const propertyIds = ownerProperties.map(p => p._id);
        
        // Get tenants who completed profile and selected this owner's properties
        const availableTenants = await Tenant.find({
            status: 'profile_completed',
            propertyId: { $in: propertyIds },
            $or: [
                { roomId: { $exists: false } },
                { roomId: null }
            ]
        }).select('name email phone occupation address emergencyContact');
        

        
        res.json(availableTenants);
    } catch (err) {
        console.error('Get available tenants error:', err);
        res.status(500).json({ error: 'Failed to fetch available tenants' });
    }
};

// Assign tenant to room
exports.assignTenantToRoom = async (req, res) => {
    try {
        const { tenantId, roomId, checkInDate } = req.body;
        

        
        // Find tenant and room
        const tenant = await Tenant.findById(tenantId);
        const room = await Room.findById(roomId);
        
        if (!tenant || !room) {
            return res.status(404).json({ error: 'Tenant or room not found' });
        }
        
        // Verify owner owns this tenant and room
        if (tenant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Check if room has space
        if (room.occupiedBeds >= room.maxBeds) {
            return res.status(400).json({ error: 'Room is at full capacity' });
        }
        
        // Generate bed ID
        const bedId = `${room.roomNumber}-B${room.occupiedBeds + 1}`;
        
        // Add tenant to room's tenants array
        if (!room.tenants) {
            room.tenants = [];
        }
        
        room.tenants.push({
            _id: new mongoose.Types.ObjectId(),
            bedId: bedId,
            tenantId: tenant._id,
            name: tenant.name,
            phone: tenant.phone,
            email: tenant.email,
            joinDate: new Date(checkInDate),
            rent: room.basePrice,
            status: 'active'
        });
        
        // Update room occupancy
        room.occupiedBeds += 1;
        room.status = room.occupiedBeds >= room.maxBeds ? 'full' : 'partial';
        
        await room.save();
        
        // Update tenant with room assignment
        tenant.ownerId = req.user._id;
        tenant.propertyId = room.propertyId;
        tenant.roomId = room._id;
        tenant.bedId = bedId;
        tenant.status = 'active';
        tenant.joinDate = new Date(checkInDate);
        await tenant.save();
        
        res.json({ message: 'Tenant assigned to room successfully' });
    } catch (err) {
        console.error('Assign tenant error:', err);
        res.status(500).json({ error: 'Failed to assign tenant to room', details: err.message });
    }
};

// Remove tenant from room
exports.removeTenantFromRoom = async (req, res) => {
    try {
        const { tenantId, propertyId, bedId } = req.body;
        
        // Find and update tenant
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        // Verify owner owns this tenant
        if (tenant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Find room and remove tenant
        const room = await Room.findById(tenant.roomId);
        if (room) {
            // Remove tenant from room's tenants array
            room.tenants = room.tenants.filter(t => t.bedId !== bedId);
            
            // Update room occupancy
            room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
            room.status = room.occupiedBeds === 0 ? 'empty' : 'partial';
            
            await room.save();
        }
        
        // Reset tenant status
        tenant.propertyId = null;
        tenant.roomId = null;
        tenant.bedId = null;
        tenant.status = 'profile_completed';
        await tenant.save();
        
        res.json({ message: 'Tenant removed from room successfully' });
    } catch (err) {
        console.error('Remove tenant error:', err);
        res.status(500).json({ error: 'Failed to remove tenant from room' });
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
                role: 'tenant'
            });
            
            await tenantUser.save();
            
            // Send email with credentials only for new users
            try {
                await sendTenantCredentials(booking.email, booking.name, password);
            } catch (emailError) {
                // Email sending failed
            }
        }
        
        // Create initial tenant record in Tenant collection (without profile completion)
        const property = await Property.findOne({ title: booking.propertyTitle });
        await Tenant.create({
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            userId: tenantUser._id,
            propertyId: property?._id,
            ownerId: req.user._id,
            status: 'profile_completed'
        });
        
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

// Get tenants with payment status
exports.getTenantsWithPayments = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { month } = req.query; // Format: YYYY-MM
        
        // Parse month or default to current month
        const targetDate = month ? new Date(month + '-01') : new Date();
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        
        // Get all active tenants for owner (including notice period)
        const tenants = await Tenant.find({
            ownerId,
            status: { $in: ['active', 'notice'] },
            roomId: { $exists: true, $ne: null }
        }).populate('propertyId', 'title');
        
        // Get rooms to get rent information
        const roomIds = tenants.map(t => t.roomId).filter(Boolean);
        const rooms = await Room.find({ _id: { $in: roomIds } });
        const roomMap = {};
        rooms.forEach(room => {
            roomMap[room._id.toString()] = room;
        });
        
        // Get payment for each tenant for the selected month
        const tenantsWithPayments = await Promise.all(
            tenants.map(async (tenant) => {
                // Find payment for the specific month
                const monthPayment = await Payment.findOne({ 
                    tenantId: tenant._id,
                    dueDate: { $gte: startOfMonth, $lte: endOfMonth }
                }).sort({ createdAt: -1 });
                
                const room = roomMap[tenant.roomId?.toString()];
                const rent = tenant.rent || room?.basePrice || 0;
                
                // Calculate due date for the month
                const dueDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 5); // 5th of each month
                
                // Create payment record if none exists for this month
                let payment = monthPayment;
                if (!payment) {
                    payment = {
                        tenantId: tenant._id,
                        propertyId: tenant.propertyId._id,
                        amountDue: rent,
                        amountPaid: 0,
                        dueDate,
                        status: 'pending',
                        paidDate: null
                    };
                }
                
                return {
                    _id: tenant._id,
                    name: tenant.name,
                    phone: tenant.phone,
                    email: tenant.email,
                    propertyId: tenant.propertyId?._id,
                    propertyTitle: tenant.propertyId?.title || 'N/A',
                    roomNumber: room?.roomNumber || 'N/A',
                    rent,
                    lastPayment: payment,
                    nextDueDate: dueDate
                };
            })
        );
        
        res.json(tenantsWithPayments);
    } catch (err) {
        console.error('Get tenants with payments error:', err);
        res.status(500).json({ error: 'Failed to fetch tenants with payments' });
    }
};

// Send payment reminder
exports.sendPaymentReminder = async (req, res) => {
    try {
        const tenantId = req.params.tenantId;
        const ownerId = req.user._id;
        
        // Find tenant and verify ownership
        const tenant = await Tenant.findOne({ _id: tenantId, ownerId })
            .populate('propertyId', 'title');
            
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        // Get room info for rent amount
        const room = await Room.findById(tenant.roomId);
        const rentAmount = tenant.rent || room?.basePrice || 0;
        
        // Calculate next due date
        let nextDueDate = new Date();
        const lastPayment = await Payment.findOne({ tenantId }).sort({ createdAt: -1 });
        if (lastPayment && lastPayment.status === 'paid') {
            nextDueDate = new Date(lastPayment.paidDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        } else {
            nextDueDate = new Date(tenant.joinDate);
            const monthsSinceJoin = Math.floor((new Date() - nextDueDate) / (1000 * 60 * 60 * 24 * 30));
            nextDueDate.setMonth(nextDueDate.getMonth() + monthsSinceJoin + 1);
        }
        
        // Send email reminder
        try {
            await sendPaymentReminder(
                tenant.email,
                tenant.name,
                tenant.propertyId.title,
                rentAmount,
                nextDueDate
            );
        } catch (emailError) {
            // Email sending failed
        }
        
        res.json({ message: 'Payment reminder sent successfully' });
    } catch (err) {
        console.error('Send reminder error:', err);
        res.status(500).json({ error: 'Failed to send reminder' });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const tenantId = req.params.tenantId;
        const { status } = req.body;
        const ownerId = req.user._id;
        
        // Verify tenant ownership
        const tenant = await Tenant.findOne({ _id: tenantId, ownerId });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        // Get rent amount
        const room = await Room.findById(tenant.roomId);
        const rentAmount = tenant.rent || room?.basePrice || 5000;
        
        // Get current month for payment record
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Use findOneAndUpdate with upsert to avoid duplicate key errors
        const updateData = {
            tenantId,
            propertyId: tenant.propertyId,
            amountDue: rentAmount,
            amountPaid: status === 'paid' ? rentAmount : (status === 'partial' ? rentAmount * 0.5 : 0),
            dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
            status,
            paidDate: status === 'paid' ? new Date() : null,
            paymentMethod: status === 'paid' ? 'cash' : null,
            notes: `Payment ${status} by owner - ${new Date().toLocaleDateString()}`
        };
        
        // Create unique identifier for tenant-month combination
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const payment = await Payment.findOneAndUpdate(
            { 
                tenantId,
                dueDate: { $gte: currentMonth, $lte: nextMonth }
            },
            {
                ...updateData,
                paymentMonth: monthKey // Add month identifier to prevent duplicates
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );
        
        // Generate invoice when status is paid
        if (status === 'paid') {
            const Invoice = require('../models/Invoice');
            const invoiceNumber = `INV-${Date.now()}`;
            
            await Invoice.create({
                tenantId,
                paymentId: payment._id,
                propertyId: tenant.propertyId,
                invoiceNumber,
                amount: payment.amountDue,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                generatedDate: new Date(),
                status: 'generated'
            });
        }
        
        res.json({ 
            message: 'Payment status updated and saved to database',
            paymentId: payment._id
        });
    } catch (err) {
        console.error('Update payment status error:', err);
        res.status(500).json({ error: 'Failed to update payment status', details: err.message });
    }
};