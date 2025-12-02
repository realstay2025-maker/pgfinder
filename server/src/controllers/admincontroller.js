// server/controllers/adminController.js
const User = require('../models/User');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Subscription = require('../models/Subscription');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.status(200).json(users);
    } catch (err) {
        console.error('Get All Users Error:', err);
        res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Don't allow deleting other admins
        if (user.role === 'admin' || user.role === 'super_admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }
        
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ error: 'Failed to delete user', details: err.message });
    }
};

// @desc    Toggle PG listing status
// @route   PUT /api/admin/users/:id/listing
// @access  Private (Admin)
exports.toggleListing = async (req, res) => {
    try {
        const { listingEnabled } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { listingEnabled },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: `Listing ${listingEnabled ? 'enabled' : 'disabled'} successfully`, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update listing status', details: err.message });
    }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProperties = await Property.countDocuments({});
        const pendingProperties = await Property.countDocuments({ status: 'pending' });
        const totalTenants = await Tenant.countDocuments({ status: 'active' });
        
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        res.status(200).json({
            totalUsers,
            totalProperties,
            pendingProperties,
            totalTenants,
            usersByRole
        });
    } catch (err) {
        console.error('Get Admin Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
    }
};

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
// @access  Private (Admin)
exports.getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('ownerId', 'name email ownerProfile')
            .sort({ createdAt: -1 });
        res.json(subscriptions);
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
    }
};

// @desc    Get subscription history for owner
// @route   GET /api/admin/subscription-history/:ownerId
// @access  Private (Admin)
exports.getSubscriptionHistory = async (req, res) => {
    try {
        const history = await Subscription.find({ ownerId: req.params.ownerId })
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history', error: error.message });
    }
};

// @desc    Update subscription status
// @route   PUT /api/admin/subscriptions/:id
// @access  Private (Admin)
exports.updateSubscriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const subscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('ownerId', 'name email');
        
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        
        res.json({ message: 'Subscription updated successfully', subscription });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update subscription', error: error.message });
    }
};