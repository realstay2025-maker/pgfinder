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
            ownerId: req.user._id,
            $or: [
                { roomId: { $exists: false } },
                { roomId: null },
                { status: 'profile_completed' }
            ]
        }).populate('userId', 'gender').select('name email phone occupation address emergencyContact userId');
        

        
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
        
        // Check gender compatibility
        const tenantUser = await User.findById(tenant.userId);
        if (tenantUser && room.gender && tenantUser.gender !== room.gender) {
            return res.status(400).json({ error: `This room is designated for ${room.gender} tenants only` });
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
        
        // Find tenant in room's tenants array first
        const room = await Room.findOne({ 
            $or: [
                { 'tenants.tenantId': tenantId },
                { 'tenants._id': tenantId }
            ]
        });
        
        if (!room) {
            return res.status(404).json({ error: 'Tenant not found in any room' });
        }
        
        // Find and update tenant in Tenant collection
        const tenant = await Tenant.findById(tenantId);
        if (tenant && tenant.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Remove tenant from room's tenants array
        room.tenants = room.tenants.filter(t => 
            t.tenantId?.toString() !== tenantId.toString() && 
            t._id?.toString() !== tenantId.toString()
        );
        
        // Update room occupancy
        room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
        room.status = room.occupiedBeds === 0 ? 'empty' : 'partial';
        
        await room.save();
        
        // Reset tenant status if tenant exists in Tenant collection
        if (tenant) {
            tenant.propertyId = null;
            tenant.roomId = null;
            tenant.bedId = null;
            tenant.status = 'profile_completed';
            await tenant.save();
        }
        
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
        
        // Get owner's properties
        const ownerProperties = await Property.find({ ownerId }).select('_id title');
        const propertyIds = ownerProperties.map(p => p._id);
        
        // Get all rooms with tenants
        const rooms = await Room.find({ 
            propertyId: { $in: propertyIds },
            'tenants.0': { $exists: true }
        }).populate('propertyId', 'title');
        
        const tenantsWithPayments = [];
        
        // Process each room's tenants
        for (const room of rooms) {
            for (const tenant of room.tenants) {
                if (tenant.status === 'active' || tenant.status === 'notice') {
                    // Find payment for the specific month
                    const monthPayment = await Payment.findOne({ 
                        tenantId: tenant.tenantId,
                        dueDate: { $gte: startOfMonth, $lte: endOfMonth }
                    }).sort({ createdAt: -1 });
                    
                    const rent = tenant.rent || room.basePrice || 0;
                    
                    // Calculate due date for the month
                    const dueDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 5);
                    
                    // Create payment record if none exists for this month
                    let payment = monthPayment;
                    if (!payment) {
                        payment = {
                            tenantId: tenant.tenantId,
                            propertyId: room.propertyId._id,
                            amountDue: rent,
                            amountPaid: 0,
                            dueDate,
                            status: 'pending',
                            paidDate: null
                        };
                    }
                    
                    tenantsWithPayments.push({
                        _id: tenant.tenantId,
                        name: tenant.name,
                        phone: tenant.phone,
                        email: tenant.email,
                        propertyId: room.propertyId._id,
                        propertyTitle: room.propertyId.title,
                        roomNumber: room.roomNumber,
                        rent,
                        lastPayment: payment,
                        nextDueDate: dueDate
                    });
                }
            }
        }
        
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

// Get/Update KYC details
exports.getKYC = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('ownerProfile');
        res.json(user.ownerProfile || {});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch KYC details' });
    }
};

exports.updateKYC = async (req, res) => {
    try {
        const { panNumber, aadhaarNumber, gstNumber, businessAddress } = req.body;
        
        const updateData = {
            'ownerProfile.panNumber': panNumber,
            'ownerProfile.aadhaarNumber': aadhaarNumber,
            'ownerProfile.gstNumber': gstNumber,
            'ownerProfile.businessAddress': businessAddress,
            'ownerProfile.kycStatus': 'pending',
            'ownerProfile.kycSubmittedAt': new Date()
        };
        
        // Handle file uploads
        if (req.files) {
            if (req.files.panCard) updateData['ownerProfile.kycDocuments.panCard'] = req.files.panCard[0].path;
            if (req.files.aadhaarCard) updateData['ownerProfile.kycDocuments.aadhaarCard'] = req.files.aadhaarCard[0].path;
            if (req.files.gstCertificate) updateData['ownerProfile.kycDocuments.gstCertificate'] = req.files.gstCertificate[0].path;
            if (req.files.businessProof) updateData['ownerProfile.kycDocuments.businessProof'] = req.files.businessProof[0].path;
        }
        
        await User.findByIdAndUpdate(req.user._id, updateData);
        res.json({ message: 'KYC details updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update KYC details' });
    }
};

// Get detailed roster with rooms and tenants
exports.getRoster = async (req, res) => {
    try {
        const ownerId = req.user._id;
        
        // Get all tenants for this owner with all fields
        const tenants = await Tenant.find({ ownerId })
            .populate('propertyId', 'title')
            .populate('roomId', 'roomNumber roomType')
            .select('name email phone address permanentAddress occupationType companyName collegeName emergencyContact aadhaarNumber documents propertyId roomId');
        
        // Group tenants by property
        const propertiesMap = {};
        
        tenants.forEach(tenant => {
            if (!tenant.propertyId) return;
            
            // Handle tenants without room assignment
            const roomId = tenant.roomId ? tenant.roomId._id.toString() : 'unassigned';
            const roomNumber = tenant.roomId ? tenant.roomId.roomNumber : 'Unassigned';
            const roomType = tenant.roomId ? tenant.roomId.roomType : 'N/A';
            
            const propertyId = tenant.propertyId._id.toString();
            
            if (!propertiesMap[propertyId]) {
                propertiesMap[propertyId] = {
                    _id: tenant.propertyId._id,
                    title: tenant.propertyId.title,
                    rooms: {}
                };
            }
            
            if (!propertiesMap[propertyId].rooms[roomId]) {
                propertiesMap[propertyId].rooms[roomId] = {
                    _id: tenant.roomId ? tenant.roomId._id : null,
                    roomNumber: roomNumber,
                    roomType: { type: roomType },
                    tenants: []
                };
            }
            
            propertiesMap[propertyId].rooms[roomId].tenants.push({
                _id: tenant._id,
                name: tenant.name,
                email: tenant.email,
                phone: tenant.phone,
                address: tenant.address,
                permanentAddress: tenant.permanentAddress,
                occupationType: tenant.occupationType,
                companyName: tenant.companyName,
                collegeName: tenant.collegeName,
                emergencyContact: tenant.emergencyContact,
                aadhaarNumber: tenant.aadhaarNumber,
                documents: tenant.documents
            });
        });
        
        // Convert to array format
        const rosterData = Object.values(propertiesMap).map(property => ({
            ...property,
            rooms: Object.values(property.rooms)
        }));
        
        res.json(rosterData);
    } catch (err) {
        console.error('Get roster error:', err);
        res.status(500).json({ error: 'Failed to fetch roster data' });
    }
};