// server/controllers/property.controller.js
const Property = require('../models/Property');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const fs = require('fs'); 

// @desc    Helper function to calculate total rooms from roomTypes array
const calculateTotalRooms = (roomTypes) => {
    if (!roomTypes || roomTypes.length === 0) return 0;
    return roomTypes.reduce((total, roomType) => total + (roomType.availableCount || 0), 0);
};

// @desc    Create a new PG property
// @route   POST /api/properties
// @access  Private (PG Owner)
exports.createProperty = async (req, res) => {
    try {
        const { title, description, line1, city, state, zip, roomTypes } = req.body;
        
        // Parse roomTypes if it's a JSON string
        let parsedRoomTypes = [];
        if (roomTypes) {
            try {
                parsedRoomTypes = typeof roomTypes === 'string' ? JSON.parse(roomTypes) : roomTypes;
            } catch (e) {
                return res.status(400).json({ error: 'Invalid room types format.' });
            }
        }
        
        // Handle images - mock for now since upload middleware might not be configured
        const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        
        // Calculate base price from room types
        const basePrice = parsedRoomTypes.length > 0 ? 
            Math.min(...parsedRoomTypes.map(rt => parseInt(rt.basePrice) || 0)) : 0;
        
        const newProperty = new Property({
            ownerId: req.user._id,
            title,
            description,
            images: imagePaths,
            basePrice,
            address: {
                line1,
                city,
                state,
                zip
            },
            roomTypes: parsedRoomTypes,
            status: 'pending'
        });

        await newProperty.save();
        
        // Create rooms in separate collection
        const roomsToCreate = [];
        parsedRoomTypes.forEach(roomType => {
            const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
            const roomCount = roomType.availableCount || 0;
            const maxBeds = bedsPerRoom[roomType.type] || 1;
            
            for (let i = 1; i <= roomCount; i++) {
                const roomNumber = `${roomType.type.charAt(0).toUpperCase()}${i.toString().padStart(2, '0')}`;
                roomsToCreate.push({
                    propertyId: newProperty._id,
                    roomNumber,
                    roomType: roomType.type,
                    maxBeds,
                    basePrice: roomType.basePrice,
                    occupiedBeds: 0,
                    status: 'empty',
                    tenants: []
                });
            }
        });
        
        if (roomsToCreate.length > 0) {
            await Room.insertMany(roomsToCreate);
        }

        res.status(201).json({ 
            message: 'Property created and submitted for admin approval.', 
            property: newProperty 
        });

    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ 
            error: 'Failed to create property.', 
            details: error.message 
        });
    }
};

// @desc    Get all properties for the logged-in owner
// @route   GET /api/properties/my
// @access  Private (PG Owner)
exports.getMyProperties = async (req, res) => {
    // 1. Basic Role Check
    if (req.user.role !== 'pg_owner') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    try {
        // 2. Find all properties linked to the authenticated owner ID
        const properties = await Property.find({ ownerId: req.user._id });
        
        // 3. Success response
        res.json(properties);
        
    } catch (err) {
        console.error("Property Fetch Error:", err);
        res.status(500).json({ error: 'Failed to fetch properties', details: err.message });
    }
};

exports.getOwnerMetrics = async (req, res) => {
    try {
        const ownerId = req.user._id;
        
        // Pipeline to aggregate all rooms belonging to the owner's properties
        const metrics = await Property.aggregate([
            // 1. Match properties owned by the current user
            { $match: { ownerId: ownerId } },
            
            // 2. Join (Lookup) rooms associated with these properties
            { $lookup: { from: 'rooms', localField: '_id', foreignField: 'propertyId', as: 'rooms' } },
            
            // 3. Deconstruct the rooms array (one document per room)
            { $unwind: '$rooms' },
            
            // 4. Group all rooms to calculate totals
            { $group: {
                _id: null,
                totalCapacity: { $sum: '$rooms.capacity' },
                totalOccupancy: { $sum: '$rooms.currentOccupancy' },
                // Collect unique property IDs to count them
                propertyCount: { $addToSet: '$_id' } 
            }},
            
            // 5. Final projection and calculation
            { $project: {
                _id: 0,
                totalCapacity: 1,
                totalOccupancy: 1,
                propertyCount: { $size: '$propertyCount' },
                // Calculate Occupancy Rate (Handle division by zero)
                occupancyRate: { 
                    $cond: [ 
                        { $eq: ['$totalCapacity', 0] }, 
                        0, 
                        { $round: [{ $multiply: [{ $divide: ['$totalOccupancy', '$totalCapacity'] }, 100] }, 2] } // Rounded to 2 decimal places
                    ] 
                }
            }}
        ]);

        // Return the first result or default zeros if no data is found
        res.json(metrics[0] || { propertyCount: 0, totalCapacity: 0, totalOccupancy: 0, occupancyRate: 0 });

    } catch (err) {
        console.error("Owner Metrics Fetch Error:", err);
        res.status(500).json({ error: 'Failed to fetch owner metrics', details: err.message });
    }
};

// @desc    PUBLIC: Get all approved properties with search/filter options
// @route   GET /api/properties/public
// @access  Public
exports.getPublicProperties = async (req, res) => {
    try {
        const { city, minPrice, maxPrice, sharingType } = req.query;
        
        // Base query: Only approved properties
        let query = { status: 'approved' }; 

        // Add optional search filters
        if (city) {
            // Case-insensitive city search
            query['address.city'] = new RegExp(city, 'i'); 
        }
        if (minPrice && !isNaN(minPrice)) {
            query.basePrice = { $gte: parseFloat(minPrice) };
        }
        if (maxPrice && !isNaN(maxPrice)) {
            query.basePrice = { ...query.basePrice, $lte: parseFloat(maxPrice) };
        }
        if (sharingType) {
            // Assumes 'sharingType' is a field in your Property model or Room model
            // For simplicity, we assume we can filter based on rooms for now.
            // A complex query would aggregate rooms, but a simple filter on a property field is easier:
            query.sharingType = sharingType;
        }

        const properties = await Property.find(query)
            .populate({
                path: 'ownerId',
                match: { listingEnabled: true },
                select: 'listingEnabled'
            })
            .select('title address basePrice propertyType roomTypes amenities images')
            .sort({ basePrice: 1 });
        
        // Filter out properties where owner has listing disabled
        const filteredProperties = properties.filter(property => property.ownerId);

        res.status(200).json(filteredProperties);

    } catch (err) {
        console.error("Public Property Fetch Error:", err);
        res.status(500).json({ error: 'Failed to fetch public listings.', details: err.message });
    }
};

exports.getRoomRoster = async (req, res) => {
    try {
        const ownerId = req.user._id;

        // Find all properties for the owner
        const properties = await Property.find({ ownerId: ownerId })
            .select('title roomTypes address')
            .lean();

        if (!properties || properties.length === 0) {
            return res.status(200).json([]);
        }

        // Get rooms with tenant data from Tenant collection
        const roster = await Promise.all(properties.map(async (property) => {
            const rooms = await Room.find({ propertyId: property._id }).lean();
            
            // Get all tenants for this property
            const tenants = await Tenant.find({ 
                propertyId: property._id,
                status: { $in: ['active', 'notice'] }
            }).select('name phone email status vacateDate roomId bedId').lean();
            
            // Group rooms by sharing type and format like RoomManagement
            const roomsByType = rooms.reduce((acc, room) => {
                if (!acc[room.roomType]) {
                    acc[room.roomType] = [];
                }
                
                // Get tenants for this specific room
                const roomTenants = tenants.filter(t => t.roomId?.toString() === room._id.toString());
                
                // Format room data to match RoomManagement structure
                acc[room.roomType].push({
                    _id: room._id,
                    roomNumber: room.roomNumber,
                    capacity: room.maxBeds,
                    currentOccupancy: roomTenants.length,
                    sharingType: room.roomType,
                    basePrice: room.basePrice,
                    status: room.status,
                    tenants: roomTenants.map(tenant => ({
                        _id: tenant._id,
                        name: tenant.name,
                        phone: tenant.phone,
                        email: tenant.email,
                        bedId: tenant.bedId,
                        joinDate: tenant.joinDate,
                        status: tenant.status,
                        vacateDate: tenant.vacateDate
                    })),
                    propertyId: room.propertyId
                });
                return acc;
            }, {});
            
            // Convert to roomTypes array format
            const roomTypes = Object.entries(roomsByType).map(([type, roomsOfType]) => ({
                type,
                basePrice: roomsOfType[0]?.basePrice || 0,
                availableCount: roomsOfType.length,
                rooms: roomsOfType,
                tenants: roomsOfType.flatMap(room => room.tenants || [])
            }));
            
            return {
                _id: property._id,
                title: property.title,
                address: property.address,
                roomTypes: roomTypes
            };
        }));

        res.status(200).json(roster);

    } catch (err) {
        console.error("Room Roster Fetch Error:", err);
        res.status(500).json({ error: 'Failed to fetch room roster', details: err.message });
    }
};

exports.getPropertyById = async (req, res) => {
    try {
        let property;
        
        // Check if user is authenticated (for owner access)
        if (req.user) {
            property = await Property.findOne({ 
                _id: req.params.id, 
                ownerId: req.user._id 
            });
        } else {
            // Public access - only approved properties
            property = await Property.findOne({ 
                _id: req.params.id, 
                status: 'approved' 
            });
        }
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.status(200).json(property);
    } catch (err) {
        console.error('Get Property Error:', err);
        res.status(500).json({ error: 'Failed to fetch property', details: err.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.status(200).json({ message: 'Property updated successfully', property });
    } catch (err) {
        console.error('Update Property Error:', err);
        res.status(500).json({ error: 'Failed to update property', details: err.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findOneAndDelete({ 
            _id: req.params.id, 
            ownerId: req.user._id 
        });
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (err) {
        console.error('Delete Property Error:', err);
        res.status(500).json({ error: 'Failed to delete property', details: err.message });
    }
};

// @desc    Assign tenant to bed
// @route   POST /api/properties/:id/assign-tenant
// @access  Private (PG Owner)
exports.assignTenant = async (req, res) => {
    try {
        const { tenantData } = req.body;
        const propertyId = req.params.id;
        
        // Verify property ownership
        const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Find the room
        const room = await Room.findOne({ propertyId, roomNumber: tenantData.roomNumber });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Check if room has space
        const currentTenants = await Tenant.countDocuments({ roomId: room._id, status: 'active' });
        if (currentTenants >= room.maxBeds) {
            return res.status(400).json({ error: 'Room is full' });
        }
        
        // Generate bed ID
        const bedId = `${room.roomNumber}-B${currentTenants + 1}`;
        
        // Get tenant details from User collection if userId provided
        let tenantDetails = tenantData;
        if (tenantData.userId) {
            const user = await User.findById(tenantData.userId);
            if (!user || user.role !== 'tenant') {
                return res.status(404).json({ error: 'Tenant user not found' });
            }
            
            tenantDetails = {
                name: user.name,
                phone: user.tenantProfile.phone || tenantData.phone,
                email: user.email,
                rent: tenantData.rent || room.basePrice
            };
            
            // Update user assignment status
            user.tenantProfile.isAssigned = true;
            user.tenantProfile.pgId = propertyId;
            user.tenantProfile.roomId = room._id;
            await user.save();
        }
        
        // Create tenant in Tenant collection
        const newTenant = new Tenant({
            propertyId,
            roomId: room._id,
            bedId,
            name: tenantDetails.name,
            phone: tenantDetails.phone,
            email: tenantDetails.email,
            rent: tenantDetails.rent,
            rentHistory: [{
                amount: tenantDetails.rent,
                effectiveDate: new Date(),
                reason: 'Initial rent'
            }],
            statusHistory: [{
                status: 'active',
                date: new Date(),
                reason: 'Tenant assigned'
            }]
        });
        
        await newTenant.save();
        res.status(200).json({ message: 'Tenant assigned successfully', tenant: newTenant });
        
    } catch (err) {
        console.error('Assign Tenant Error:', err);
        res.status(500).json({ error: 'Failed to assign tenant', details: err.message });
    }
};

// @desc    Remove tenant from bed
// @route   DELETE /api/properties/:id/remove-tenant
// @access  Private (PG Owner)
exports.removeTenant = async (req, res) => {
    try {
        const { tenantId } = req.body;
        const propertyId = req.params.id;
        
        // Verify property ownership
        const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Find and update tenant status
        const tenant = await Tenant.findOne({ _id: tenantId, propertyId });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        // Update tenant status to moved_out and add to history
        tenant.status = 'moved_out';
        tenant.moveOutDate = new Date();
        tenant.statusHistory.push({
            status: 'moved_out',
            date: new Date(),
            reason: 'Removed by owner'
        });
        
        // Update user assignment status if linked
        const user = await User.findOne({ email: tenant.email, role: 'tenant' });
        if (user) {
            user.tenantProfile.isAssigned = false;
            user.tenantProfile.pgId = null;
            user.tenantProfile.roomId = null;
            await user.save();
        }
        
        await tenant.save();
        res.status(200).json({ message: 'Tenant removed successfully' });
        
    } catch (err) {
        console.error('Remove Tenant Error:', err);
        res.status(500).json({ error: 'Failed to remove tenant', details: err.message });
    }
};

// @desc    Update room number
// @route   PUT /api/properties/:id/update-room
// @access  Private (PG Owner)
exports.updateRoom = async (req, res) => {
    try {
        const { oldRoomNumber, newRoomNumber } = req.body;
        const propertyId = req.params.id;
        
        // Verify property ownership
        const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Update room in Room collection
        const room = await Room.findOne({ propertyId, roomNumber: oldRoomNumber });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Update room number and tenant bedIds
        room.roomNumber = newRoomNumber;
        room.tenants.forEach(tenant => {
            const bedNumber = tenant.bedId.split('-B')[1];
            tenant.bedId = `${newRoomNumber}-B${bedNumber}`;
        });
        
        await room.save();
        res.status(200).json({ message: 'Room number updated successfully' });
        
    } catch (err) {
        console.error('Update Room Error:', err);
        res.status(500).json({ error: 'Failed to update room', details: err.message });
    }
};

// @desc    Get available tenants for assignment
// @route   GET /api/properties/available-tenants
// @access  Private (PG Owner)
exports.getAvailableTenants = async (req, res) => {
    try {
        // Find tenants who have completed profile but are not assigned
        const availableTenants = await User.find({
            role: 'tenant',
            'tenantProfile.profileCompleted': true,
            'tenantProfile.isAssigned': false
        }).select('name email tenantProfile.phone tenantProfile.occupation');
        
        res.status(200).json(availableTenants);
        
    } catch (err) {
        console.error('Get Available Tenants Error:', err);
        res.status(500).json({ error: 'Failed to fetch available tenants', details: err.message });
    }
};

// @desc    Get all property names for registration dropdown
// @route   GET /api/properties/names
// @access  Public
exports.getPropertyNames = async (req, res) => {
    try {
        const properties = await Property.find({ status: 'approved' })
            .select('title')
            .sort({ title: 1 });
        
        res.status(200).json(properties);
        
    } catch (err) {
        console.error('Get Property Names Error:', err);
        res.status(500).json({ error: 'Failed to fetch property names', details: err.message });
    }
};

// @desc    Get all properties (Admin only)
// @route   GET /api/properties
// @access  Private (Admin)
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find({})
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json(properties);
        
    } catch (err) {
        console.error('Get All Properties Error:', err);
        res.status(500).json({ error: 'Failed to fetch properties', details: err.message });
    }
};

// @desc    Update property status (Admin only)
// @route   PUT /api/properties/:id/status
// @access  Private (Admin)
exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.status(200).json({ message: 'Property status updated successfully', property });
        
    } catch (err) {
        console.error('Update Property Status Error:', err);
        res.status(500).json({ error: 'Failed to update property status', details: err.message });
    }
};