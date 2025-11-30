const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Room = require('../models/Room');
const puppeteer = require('puppeteer');

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

module.exports = {
    getTenantInvoices,
    generateInvoicePDF
};

