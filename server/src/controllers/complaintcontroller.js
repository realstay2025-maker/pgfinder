// server/controllers/complaintController.js
const Complaint = require('../models/Complaint');
const Property = require('../models/Property');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Submit complaint
// @route   POST /api/complaints
// @access  Private (Tenant)
exports.submitComplaint = async (req, res) => {
    try {
        const { subject, description, category, priority, propertyId, roomId } = req.body;

        const complaint = new Complaint({
            tenantId: req.user._id,
            propertyId,
            roomId,
            subject,
            description,
            category,
            priority,
            status: 'pending'
        });

        await complaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully', complaint });
    } catch (err) {
        console.error('Submit Complaint Error:', err);
        res.status(500).json({ error: 'Failed to submit complaint', details: err.message });
    }
};

// @desc    Get owner complaints
// @route   GET /api/complaints/owner/all
// @access  Private (Owner)
exports.getOwnerComplaints = async (req, res) => {
    try {
        const properties = await Property.find({ ownerId: req.user._id });
        const propertyIds = properties.map(p => p._id);

        const complaints = await Complaint.find({ propertyId: { $in: propertyIds } })
            .populate('tenantId', 'name email')
            .populate('propertyId', 'title')
            .populate('roomId', 'roomNumber')
            .sort({ createdAt: -1 });

        const formattedComplaints = complaints.map(complaint => ({
            _id: complaint._id,
            subject: complaint.subject,
            description: complaint.description,
            status: complaint.status,
            priority: complaint.priority,
            category: complaint.category,
            propertyTitle: complaint.propertyId?.title || 'Unknown Property',
            roomNumber: complaint.roomId?.roomNumber || 'Unknown Room',
            tenantName: complaint.tenantId?.name || 'Unknown Tenant',
            createdAt: complaint.createdAt
        }));

        res.status(200).json(formattedComplaints);
    } catch (err) {
        console.error('Get Owner Complaints Error:', err);
        res.status(500).json({ error: 'Failed to fetch complaints', details: err.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Owner)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.status(200).json({ message: 'Complaint status updated', complaint });
    } catch (err) {
        console.error('Update Complaint Status Error:', err);
        res.status(500).json({ error: 'Failed to update complaint status', details: err.message });
    }
};

// @desc    Get tenant complaints
// @route   GET /api/complaints/tenant/my-complaints
// @access  Private (Tenant)
exports.getTenantComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ tenantId: req.user._id })
            .populate('propertyId', 'title')
            .populate('roomId', 'roomNumber')
            .sort({ createdAt: -1 });
        
        res.json(complaints);
    } catch (err) {
        console.error('Get tenant complaints error:', err);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};