const Property = require('../models/Property');
const SavedSearch = require('../models/SavedSearch');
const PropertyAlert = require('../models/PropertyAlert');

// Advanced property search with filters
const searchProperties = async (req, res) => {
    try {
        const {
            city,
            area,
            minPrice,
            maxPrice,
            amenities,
            roomType,
            lat,
            lng,
            radius = 5,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        let query = { status: 'approved' };
        let sort = {};

        // Location-based search
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            };
        } else if (city) {
            query['address.city'] = new RegExp(city, 'i');
            if (area) {
                query['address.line1'] = new RegExp(area, 'i');
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query['roomTypes.basePrice'] = {};
            if (minPrice) query['roomTypes.basePrice'].$gte = parseInt(minPrice);
            if (maxPrice) query['roomTypes.basePrice'].$lte = parseInt(maxPrice);
        }

        // Amenities filter
        if (amenities) {
            const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',');
            query.amenities = { $in: amenityList };
        }

        // Room type filter
        if (roomType) {
            query['roomTypes.type'] = roomType;
        }

        // Sorting
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        const properties = await Property.find(query)
            .populate('ownerId', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Property.countDocuments(query);

        res.json({
            properties,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
};

// Get nearby services for a property
const getNearbyServices = async (req, res) => {
    try {
        const { lat, lng, radius = 2 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude required' });
        }

        // Mock nearby services (in production, integrate with Google Places API)
        const nearbyServices = {
            hospitals: [
                { name: 'City Hospital', distance: 1.2, type: 'General Hospital' },
                { name: 'Apollo Clinic', distance: 0.8, type: 'Clinic' }
            ],
            schools: [
                { name: 'ABC Public School', distance: 0.5, type: 'School' },
                { name: 'XYZ College', distance: 1.8, type: 'College' }
            ],
            transport: [
                { name: 'Metro Station', distance: 0.3, type: 'metro' },
                { name: 'Bus Stop', distance: 0.1, type: 'bus_stop' }
            ],
            shopping: [
                { name: 'City Mall', distance: 1.5, type: 'Mall' },
                { name: 'Local Market', distance: 0.4, type: 'Market' }
            ]
        };

        res.json(nearbyServices);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get nearby services', error: error.message });
    }
};

// Save search preferences
const saveSearch = async (req, res) => {
    try {
        const { name, filters, alertsEnabled = true } = req.body;
        const userId = req.user.id;

        const savedSearch = new SavedSearch({
            userId,
            name,
            filters,
            alertsEnabled
        });

        await savedSearch.save();
        res.status(201).json({ message: 'Search saved successfully', savedSearch });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save search', error: error.message });
    }
};

// Get user's saved searches
const getSavedSearches = async (req, res) => {
    try {
        const userId = req.user.id;
        const savedSearches = await SavedSearch.find({ userId }).sort({ createdAt: -1 });
        res.json(savedSearches);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get saved searches', error: error.message });
    }
};

// Delete saved search
const deleteSavedSearch = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await SavedSearch.findOneAndDelete({ _id: id, userId });
        res.json({ message: 'Saved search deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete saved search', error: error.message });
    }
};

// Get property recommendations
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's saved searches to understand preferences
        const savedSearches = await SavedSearch.find({ userId }).limit(3);
        
        let query = { status: 'approved' };
        
        if (savedSearches.length > 0) {
            const lastSearch = savedSearches[0];
            if (lastSearch.filters.location?.city) {
                query['address.city'] = new RegExp(lastSearch.filters.location.city, 'i');
            }
            if (lastSearch.filters.priceRange) {
                query['roomTypes.basePrice'] = {
                    $gte: lastSearch.filters.priceRange.min || 0,
                    $lte: lastSearch.filters.priceRange.max || 50000
                };
            }
        }

        const recommendations = await Property.find(query)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .limit(6);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
    }
};

// Get property alerts
const getPropertyAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const alerts = await PropertyAlert.find({ userId })
            .populate('propertyId', 'title address images')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get alerts', error: error.message });
    }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await PropertyAlert.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true }
        );

        res.json({ message: 'Alert marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark alert as read', error: error.message });
    }
};

module.exports = {
    searchProperties,
    getNearbyServices,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    getRecommendations,
    getPropertyAlerts,
    markAlertAsRead
};