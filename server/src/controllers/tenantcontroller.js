const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Room = require('../models/Room');
const User = require('../models/User');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Get tenant invoices
const getTenantInvoices = async (req, res) => {
    try {
        // Find tenant by user email
        const tenant = await Tenant.findOne({ email: req.user.email });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        const invoices = await Invoice.find({ tenantId: tenant._id })
            .populate('propertyId', 'title address')
            .populate('paymentId', 'paidDate')
            .sort({ createdAt: -1 });
            
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

// Generate PDF invoice
const generateInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        
        const invoice = await Invoice.findById(invoiceId)
            .populate('tenantId', 'name email phone')
            .populate('propertyId', 'title address')
            .populate('paymentId', 'paidDate paymentMethod');
            
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        // HTML template for PDF
        const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
                .invoice-title { color: #4F46E5; font-size: 28px; margin: 0; }
                .invoice-number { color: #666; margin: 10px 0; }
                .section { margin-bottom: 30px; }
                .section-title { color: #4F46E5; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; }
                .detail-row { margin: 8px 0; }
                .amount { font-size: 24px; font-weight: bold; color: #059669; background: #F0FDF4; padding: 15px; border-radius: 8px; text-align: center; }
                .footer { margin-top: 50px; text-align: center; color: #666; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="invoice-title">PAYMENT INVOICE</h1>
                <p class="invoice-number">Invoice #: ${invoice.invoiceNumber}</p>
            </div>
            
            <div class="section">
                <h3 class="section-title">Tenant Details</h3>
                <div class="detail-row"><strong>Name:</strong> ${invoice.tenantId.name}</div>
                <div class="detail-row"><strong>Email:</strong> ${invoice.tenantId.email}</div>
                <div class="detail-row"><strong>Phone:</strong> ${invoice.tenantId.phone}</div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Property Details</h3>
                <div class="detail-row"><strong>Property:</strong> ${invoice.propertyId.title}</div>
                <div class="detail-row"><strong>Address:</strong> ${invoice.propertyId.address.line1}, ${invoice.propertyId.address.city}</div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Payment Details</h3>
                <div class="detail-row"><strong>Period:</strong> ${invoice.month}/${invoice.year}</div>
                <div class="detail-row"><strong>Payment Date:</strong> ${new Date(invoice.paymentId.paidDate).toLocaleDateString()}</div>
                <div class="detail-row"><strong>Payment Method:</strong> ${invoice.paymentId.paymentMethod}</div>
            </div>
            
            <div class="amount">
                <strong>Amount Paid: ₹${invoice.amount.toLocaleString()}</strong>
            </div>
            
            <div class="footer">
                <p>Thank you for your payment!</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>`;
        
        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(invoiceHTML);
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        await browser.close();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
        res.send(pdfBuffer);
        
        // Update invoice status
        await Invoice.findByIdAndUpdate(invoiceId, { status: 'downloaded' });
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate invoice PDF' });
    }
};

// Get tenant profile
const getTenantProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'tenant') {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const tenant = await Tenant.findOne({ userId: user._id });
        
        // Get PG name from user's tenantProfile or from Property if tenant is assigned
        let pgName = user.tenantProfile?.pgName || '';
        
        // If tenant is assigned to a property, get the actual property name
        if (tenant?.propertyId) {
            const property = await Property.findById(tenant.propertyId).select('title');
            if (property) {
                pgName = property.title;
            }
        }
        
        const profileData = {
            pgName: pgName || 'Not selected',
            phone: tenant?.phone || '',
            address: tenant?.address || '',
            permanentAddress: tenant?.permanentAddress || '',
            emergencyContact: tenant?.emergencyContact || '',
            occupation: tenant?.occupation || '',
            occupationType: tenant?.occupationType || 'working',
            companyName: tenant?.companyName || '',
            collegeName: tenant?.collegeName || '',
            aadhaarNumber: tenant?.aadhaarNumber || '',
            documents: tenant?.documents || {},
            profileCompleted: !!(tenant?.phone && tenant?.address && tenant?.permanentAddress && tenant?.emergencyContact && tenant?.occupation && tenant?.aadhaarNumber)
        };
        
        res.json(profileData);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Validation helper function
const validateTenantProfile = (data) => {
    const errors = [];
    
    // Phone validation
    if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
        errors.push('Phone number must be a valid 10-digit Indian mobile number');
    }
    
    // Aadhaar validation
    if (!data.aadhaarNumber || !/^\d{12}$/.test(data.aadhaarNumber)) {
        errors.push('Aadhaar number must be exactly 12 digits');
    }
    
    // Emergency contact validation
    if (!data.emergencyContact || !/^[6-9]\d{9}$/.test(data.emergencyContact)) {
        errors.push('Emergency contact must be a valid 10-digit mobile number');
    }
    
    // Address validation
    if (!data.address || data.address.trim().length < 10) {
        errors.push('Current address must be at least 10 characters');
    }
    
    if (!data.permanentAddress || data.permanentAddress.trim().length < 10) {
        errors.push('Permanent address must be at least 10 characters');
    }
    
    // Occupation validation
    if (!data.occupation || data.occupation.trim().length < 2) {
        errors.push('Occupation/Course is required');
    }
    
    // Occupation type specific validation
    if (data.occupationType === 'working' && (!data.companyName || data.companyName.trim().length < 2)) {
        errors.push('Company name is required for working professionals');
    }
    
    if (data.occupationType === 'student' && (!data.collegeName || data.collegeName.trim().length < 2)) {
        errors.push('College/University name is required for students');
    }
    
    return errors;
};

// Update tenant profile
const updateTenantProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'tenant') {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const {
            phone, address, permanentAddress, emergencyContact, 
            occupation, occupationType, companyName, collegeName, aadhaarNumber
        } = req.body;
        
        // Validate input data
        const validationErrors = validateTenantProfile(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join('. ') });
        }
        
        // Check if files are uploaded
        if (!req.files || !req.files.aadhaarCard || !req.files.photo) {
            return res.status(400).json({ error: 'Both Aadhaar card and photo are required' });
        }

        // Handle file uploads
        const documents = {
            aadhaarCard: req.files.aadhaarCard[0].path,
            photo: req.files.photo[0].path
        };

        // Find or create tenant record
        let tenant = await Tenant.findOne({ userId: user._id });
        
        const tenantData = {
            userId: user._id,
            name: user.name,
            email: user.email,
            phone,
            address,
            permanentAddress,
            emergencyContact,
            occupation,
            occupationType,
            companyName: occupationType === 'working' ? companyName : '',
            collegeName: occupationType === 'student' ? collegeName : '',
            aadhaarNumber,
            documents: tenant?.documents ? { ...tenant.documents, ...documents } : documents,
            status: 'profile_completed',
            profileCompletedAt: new Date()
        };

        if (tenant) {
            tenant = await Tenant.findByIdAndUpdate(tenant._id, tenantData, { new: true });
        } else {
            tenant = new Tenant(tenantData);
            await tenant.save();
        }

        const profileCompleted = !!(phone && address && permanentAddress && emergencyContact && occupation && aadhaarNumber);
        
        res.json({ 
            message: 'Profile updated successfully',
            profileCompleted,
            tenant
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get tenant profile for owner (with all details)
const getTenantProfileForOwner = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const ownerId = req.user._id;
        
        // First try to find tenant in Tenant collection
        let tenant = await Tenant.findById(tenantId)
            .populate('userId', 'name email tenantProfile')
            .populate('propertyId', 'title')
            .populate('roomId', 'roomNumber');
            
        if (tenant && tenant.ownerId.toString() === ownerId.toString()) {
            // Found in Tenant collection
            const profileData = {
                _id: tenant._id,
                name: tenant.name,
                email: tenant.email,
                phone: tenant.phone,
                address: tenant.address,
                permanentAddress: tenant.permanentAddress,
                emergencyContact: tenant.emergencyContact,
                occupation: tenant.occupation,
                occupationType: tenant.occupationType,
                companyName: tenant.companyName,
                collegeName: tenant.collegeName,
                aadhaarNumber: tenant.aadhaarNumber,
                documents: tenant.documents,
                pgName: tenant.propertyId?.title || 'Not assigned',
                roomDetails: tenant.roomId ? {
                    roomNumber: tenant.roomId.roomNumber,
                    bedId: tenant.bedId
                } : null,
                rent: tenant.rent,
                joinDate: tenant.joinDate,
                status: tenant.status,
                profileCompleted: !!(tenant.phone && tenant.address && tenant.permanentAddress && tenant.emergencyContact && tenant.occupation && tenant.aadhaarNumber)
            };
            
            return res.json(profileData);
        }
        
        // If not found in Tenant collection, search in Room.tenants
        const ownerProperties = await Property.find({ ownerId }).select('_id');
        const propertyIds = ownerProperties.map(p => p._id);
        
        const room = await Room.findOne({
            propertyId: { $in: propertyIds },
            'tenants.tenantId': tenantId
        }).populate('propertyId', 'title');
        
        if (!room) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        const roomTenant = room.tenants.find(t => t.tenantId.toString() === tenantId);
        if (!roomTenant) {
            return res.status(404).json({ error: 'Tenant not found in room' });
        }
        
        // Try to get additional profile data from Tenant collection
        const tenantProfile = await Tenant.findOne({ 
            $or: [
                { userId: tenantId },
                { email: roomTenant.email }
            ]
        });
        
        const profileData = {
            _id: roomTenant.tenantId,
            name: roomTenant.name,
            email: roomTenant.email,
            phone: roomTenant.phone,
            address: tenantProfile?.address || 'Not provided',
            permanentAddress: tenantProfile?.permanentAddress || 'Not provided',
            emergencyContact: tenantProfile?.emergencyContact || 'Not provided',
            occupation: tenantProfile?.occupation || 'Not provided',
            occupationType: tenantProfile?.occupationType || 'working',
            companyName: tenantProfile?.companyName || 'Not provided',
            collegeName: tenantProfile?.collegeName || 'Not provided',
            aadhaarNumber: tenantProfile?.aadhaarNumber || 'Not provided',
            documents: tenantProfile?.documents || {},
            pgName: room.propertyId?.title || 'Not assigned',
            roomDetails: {
                roomNumber: room.roomNumber,
                bedId: roomTenant.bedId
            },
            rent: room.basePrice,
            joinDate: roomTenant.joinDate,
            status: roomTenant.status,
            profileCompleted: !!(tenantProfile?.phone && tenantProfile?.address && tenantProfile?.permanentAddress && tenantProfile?.emergencyContact && tenantProfile?.occupation && tenantProfile?.aadhaarNumber)
        };
        
        res.json(profileData);
    } catch (err) {
        console.error('Get tenant profile for owner error:', err);
        res.status(500).json({ error: 'Failed to fetch tenant profile' });
    }
};

module.exports = {
    getTenantInvoices,
    generateInvoicePDF,
    getTenantProfile,
    updateTenantProfile,
    getTenantProfileForOwner
};

