// server/controllers/paymentController.js
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get tenant payments
// @route   GET /api/payments/tenant/my-payments
// @access  Private (Tenant)
exports.getTenantPayments = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ 
            email: req.user.email, 
            status: 'active' 
        });

        if (!tenant) {
            return res.status(200).json({
                summary: {
                    totalDues: 0,
                    nextDueAmount: 0,
                    nextDueDate: null
                },
                payments: []
            });
        }

        const payments = await Payment.find({ tenantId: tenant._id })
            .sort({ dueDate: -1 });

        const totalDues = payments
            .filter(p => p.status !== 'paid')
            .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

        const nextPayment = payments
            .filter(p => p.status !== 'paid')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

        const summary = {
            totalDues,
            nextDueAmount: nextPayment?.amountDue || 0,
            nextDueDate: nextPayment?.dueDate || null
        };

        res.status(200).json({ summary, payments });
    } catch (err) {
        console.error('Get Tenant Payments Error:', err);
        res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
    }
};

// @desc    Get owner payment summary
// @route   GET /api/payments/owner/summary
// @access  Private (Owner)
exports.getOwnerPaymentSummary = async (req, res) => {
    try {
        const properties = await Property.find({ ownerId: req.user._id });
        const propertyIds = properties.map(p => p._id);

        const tenants = await Tenant.find({ 
            propertyId: { $in: propertyIds },
            status: 'active'
        });
        const tenantIds = tenants.map(t => t._id);

        const payments = await Payment.find({ tenantId: { $in: tenantIds } });

        const totalCollected = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amountPaid, 0);

        const totalPending = payments
            .filter(p => p.status !== 'paid')
            .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthCollection = payments
            .filter(p => p.status === 'paid' && new Date(p.paidDate) >= thisMonth)
            .reduce((sum, p) => sum + p.amountPaid, 0);

        const overdueAmount = payments
            .filter(p => p.status !== 'paid' && new Date(p.dueDate) < new Date())
            .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

        const recentPayments = await Payment.find({ 
            tenantId: { $in: tenantIds },
            status: 'paid'
        })
        .populate('tenantId', 'name')
        .sort({ paidDate: -1 })
        .limit(5);

        const pendingPayments = await Payment.find({ 
            tenantId: { $in: tenantIds },
            status: { $ne: 'paid' }
        })
        .populate('tenantId', 'name')
        .sort({ dueDate: 1 })
        .limit(5);

        res.status(200).json({
            summary: {
                totalCollected,
                totalPending,
                thisMonthCollection,
                overdueAmount
            },
            recentPayments: recentPayments.map(p => ({
                id: p._id,
                tenantName: p.tenantId?.name || 'Unknown',
                amount: p.amountPaid,
                date: p.paidDate,
                status: p.status,
                property: 'Property Name' // Add property lookup if needed
            })),
            pendingPayments: pendingPayments.map(p => ({
                id: p._id,
                tenantName: p.tenantId?.name || 'Unknown',
                amount: p.amountDue - p.amountPaid,
                dueDate: p.dueDate,
                status: p.status,
                property: 'Property Name'
            }))
        });
    } catch (err) {
        console.error('Get Owner Payment Summary Error:', err);
        res.status(500).json({ error: 'Failed to fetch payment summary', details: err.message });
    }
};