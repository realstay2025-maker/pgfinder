// server/controllers/tenantController.js
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get tenant profile
// @route   GET /api/tenant/profile
// @access  Private (Tenant)
exports.getTenantProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user.tenantProfile);
    } catch (err) {
        console.error('Get Tenant Profile Error:', err);
        res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
    }
};

// @desc    Update tenant profile
// @route   PUT /api/tenant/profile
// @access  Private (Tenant)
exports.updateTenantProfile = async (req, res) => {
    try {
        const { phone, address, emergencyContact, occupation } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update tenant profile
        user.tenantProfile.phone = phone;
        user.tenantProfile.address = address;
        user.tenantProfile.emergencyContact = emergencyContact;
        user.tenantProfile.occupation = occupation;
        
        // Mark profile as completed if all required fields are filled
        const isCompleted = phone && address && emergencyContact && occupation;
        user.tenantProfile.profileCompleted = isCompleted;
        
        await user.save();
        
        res.status(200).json({ 
            message: 'Profile updated successfully', 
            profileCompleted: isCompleted,
            profile: user.tenantProfile 
        });
        
    } catch (err) {
        console.error('Update Tenant Profile Error:', err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
};

// @desc    Get available properties for tenant registration
// @route   GET /api/tenant/available-properties
// @access  Private (Tenant)
exports.getAvailableProperties = async (req, res) => {
    try {
        // Only show approved properties with available beds
        const properties = await Property.find({ status: 'approved' })
            .select('title address roomTypes')
            .lean();
        
        // Filter properties that have available beds
        const availableProperties = properties.filter(property => {
            return property.roomTypes.some(roomType => {
                const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                const totalBeds = (roomType.availableCount || 0) * (bedsPerRoom[roomType.type] || 1);
                const occupiedBeds = roomType.occupiedBeds || 0;
                return totalBeds > occupiedBeds;
            });
        });
        
        res.status(200).json(availableProperties);
        
    } catch (err) {
        console.error('Get Available Properties Error:', err);
        res.status(500).json({ error: 'Failed to fetch properties', details: err.message });
    }
};

// @desc    Get tenant lease info
// @route   GET /api/tenant/my-lease-info
// @access  Private (Tenant)
exports.getTenantLeaseInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('tenantProfile');
        
        if (!user || !user.tenantProfile.isAssigned) {
            return res.status(200).json({
                propertyName: user?.tenantProfile?.pgName || 'Not Assigned',
                roomNumber: 'Pending Assignment',
                isAssigned: false
            });
        }
        
        // Get tenant details from Tenant collection
        const tenant = await Tenant.findOne({ 
            email: req.user.email, 
            status: 'active' 
        }).populate('propertyId', 'title').populate('roomId', 'roomNumber');
        
        if (!tenant) {
            return res.status(200).json({
                propertyName: user.tenantProfile.pgName || 'Not Assigned',
                roomNumber: 'Pending Assignment',
                isAssigned: false
            });
        }
        
        res.status(200).json({
            propertyName: tenant.propertyId?.title || 'Unknown Property',
            roomNumber: tenant.roomId?.roomNumber || tenant.bedId || 'Unknown Room',
            isAssigned: true,
            rent: tenant.rent,
            moveInDate: tenant.createdAt
        });
        
    } catch (err) {
        console.error('Get Tenant Lease Info Error:', err);
        res.status(500).json({ error: 'Failed to fetch lease info', details: err.message });
    }
};