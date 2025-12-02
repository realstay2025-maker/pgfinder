const Notice = require('../models/Notice');
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');

// Submit notice to leave
exports.submitNotice = async (req, res) => {
    try {
        const { vacateDate, reason } = req.body;
        
        // Check if today is first 5 days of month
        const today = new Date();
        const dayOfMonth = today.getDate();
        if (dayOfMonth > 5) {
            return res.status(400).json({ 
                error: 'Notice can only be submitted during the first 5 days of the month' 
            });
        }
        
        // Find tenant record
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant || !tenant.roomId) {
            return res.status(404).json({ error: 'Tenant not found or not assigned to room' });
        }
        
        // Check if notice already exists
        const existingNotice = await Notice.findOne({ 
            tenantId: tenant._id, 
            status: 'pending' 
        });
        if (existingNotice) {
            return res.status(400).json({ error: 'Notice already submitted' });
        }
        
        const notice = await Notice.create({
            tenantId: tenant._id,
            ownerId: tenant.ownerId,
            propertyId: tenant.propertyId,
            roomId: tenant.roomId,
            vacateDate: new Date(vacateDate),
            reason
        });
        
        res.json({ message: 'Notice submitted successfully', noticeId: notice._id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit notice' });
    }
};

// Get tenant's notices
exports.getTenantNotices = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        const notices = await Notice.find({ tenantId: tenant._id })
            .populate('propertyId', 'title')
            .sort({ createdAt: -1 });
            
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
};

// Revoke notice
exports.revokeNotice = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        const notice = await Notice.findOneAndUpdate(
            { _id: req.params.id, tenantId: tenant._id, status: 'pending' },
            { status: 'revoked' },
            { new: true }
        );
        
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found or cannot be revoked' });
        }
        
        res.json({ message: 'Notice revoked successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to revoke notice' });
    }
};

// Get owner's notices
exports.getOwnerNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ ownerId: req.user._id })
            .populate('tenantId', 'name email phone')
            .populate('propertyId', 'title')
            .populate('roomId', 'roomNumber')
            .sort({ createdAt: -1 });
            
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
};

// Update notice status
exports.updateNoticeStatus = async (req, res) => {
    try {
        const { status, ownerResponse } = req.body;
        
        const notice = await Notice.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            { status, ownerResponse },
            { new: true }
        );
        
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        
        // If approved, update tenant status to notice period
        if (status === 'approved') {
            await Tenant.findByIdAndUpdate(notice.tenantId, { 
                status: 'notice',
                vacateDate: notice.vacateDate
            });
        }
        
        res.json({ message: 'Notice status updated', notice });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update notice status' });
    }
};