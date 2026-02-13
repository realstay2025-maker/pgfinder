const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Room = require('../models/Room');
const User = require('../models/User');
// const puppeteer = require('puppeteer'); // Removed for deployment
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
        // const browser = await puppeteer.launch({ headless: true }); // Removed for deployment
        throw new Error('PDF generation temporarily disabled for deployment');
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
            // Personal Details
            pgName: pgName || 'Not selected',
            fullName: tenant?.name || user.name || '',
            dateOfBirth: tenant?.dateOfBirth || '',
            age: tenant?.age || '',
            bloodGroup: tenant?.bloodGroup || '',
            aadhaarNumber: tenant?.aadhaarNumber || '',
            panNumber: tenant?.panNumber || '',
            phone: tenant?.phone || '',
            email: user.email || '',
            permanentAddress: tenant?.permanentAddress || '',
            
            // Academic/Employment
            institute: tenant?.institute || '',
            designation: tenant?.designation || '',
            collegeCompanyId: tenant?.collegeCompanyId || '',
            institutionAddress: tenant?.institutionAddress || '',
            
            // Emergency Contact
            emergencyContactName: tenant?.emergencyContactName || '',
            relationship: tenant?.relationship || '',
            emergencyMobile1: tenant?.emergencyMobile1 || '',
            emergencyMobile2: tenant?.emergencyMobile2 || '',
            
            // Medical
            medicalConditions: tenant?.medicalConditions || '',
            allergies: tenant?.allergies || '',
            regularMedication: tenant?.regularMedication || '',
            
            // Documents
            aadhaarCardSubmitted: tenant?.aadhaarCardSubmitted || false,
            panCardSubmitted: tenant?.panCardSubmitted || false,
            collegeIdSubmitted: tenant?.collegeIdSubmitted || false,
            photographsSubmitted: tenant?.photographsSubmitted || false,
            documents: tenant?.documents || {},
            
            // Legacy fields for compatibility
            address: tenant?.address || '',
            occupation: tenant?.occupation || '',
            occupationType: tenant?.occupationType || 'working',
            companyName: tenant?.companyName || '',
            collegeName: tenant?.collegeName || '',
            emergencyContact: tenant?.emergencyMobile1 || '',
            
            profileCompleted: !!(
                tenant?.phone && tenant?.permanentAddress && 
                tenant?.dateOfBirth && tenant?.aadhaarNumber && 
                tenant?.institute && tenant?.designation &&
                tenant?.emergencyContactName && tenant?.medicalConditions
            )
        };
        
        res.json(profileData);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};


// Update tenant profile
const updateTenantProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'tenant') {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const {
            fullName, dateOfBirth, age, bloodGroup, panNumber,
            phone, email, permanentAddress, pgName,
            institute, designation, collegeCompanyId, institutionAddress,
            emergencyContactName, relationship, emergencyMobile1, emergencyMobile2,
            medicalConditions, allergies, regularMedication,
            aadhaarCardSubmitted, panCardSubmitted, collegeIdSubmitted, photographsSubmitted,
            aadhaarNumber
        } = req.body;
        
        // Handle file uploads
        const documents = {};
        if (req.files?.photo?.[0]) {
            documents.photo = req.files.photo[0].path;
        }
        if (req.files?.aadhaarCard?.[0]) {
            documents.aadhaarCard = req.files.aadhaarCard[0].path;
        }
        if (req.files?.panCard?.[0]) {
            documents.panCard = req.files.panCard[0].path;
        }
        if (req.files?.collegeId?.[0]) {
            documents.collegeId = req.files.collegeId[0].path;
        }
        if (req.files?.photographs?.[0]) {
            documents.photographs = req.files.photographs[0].path;
        }

        // Find or create tenant record
        let tenant = await Tenant.findOne({ userId: user._id });
        
        const tenantData = {
            userId: user._id,
            name: fullName || user.name,
            email: email || user.email,
            // Personal Details
            dateOfBirth,
            age: parseInt(age),
            bloodGroup,
            aadhaarNumber,
            panNumber,
            phone,
            permanentAddress,
            pgName,
            // Academic/Employment
            institute,
            designation,
            collegeCompanyId,
            institutionAddress,
            // Emergency Contact
            emergencyContactName,
            relationship,
            emergencyMobile1,
            emergencyMobile2,
            // Medical Information
            medicalConditions,
            allergies,
            regularMedication,
            // Document flags
            aadhaarCardSubmitted: aadhaarCardSubmitted === 'true' || aadhaarCardSubmitted === true,
            panCardSubmitted: panCardSubmitted === 'true' || panCardSubmitted === true,
            collegeIdSubmitted: collegeIdSubmitted === 'true' || collegeIdSubmitted === true,
            photographsSubmitted: photographsSubmitted === 'true' || photographsSubmitted === true,
            documents: tenant?.documents ? { ...tenant.documents, ...documents } : documents,
            status: 'profile_completed',
            profileCompletedAt: new Date()
        };

        if (tenant) {
            Object.assign(tenant, tenantData);
            await tenant.save();
        } else {
            tenant = new Tenant(tenantData);
            await tenant.save();
        }

        // Check if profile is truly complete
        const requiredFields = [
            fullName, dateOfBirth, age, bloodGroup, aadhaarNumber, panNumber,
            phone, permanentAddress, institute, designation,
            emergencyContactName, relationship, emergencyMobile1,
            medicalConditions, allergies, regularMedication
        ];
        const profileCompleted = requiredFields.every(field => field && String(field).trim());
        
        res.json({ 
            message: 'Profile updated successfully',
            profileCompleted,
            tenant
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
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

