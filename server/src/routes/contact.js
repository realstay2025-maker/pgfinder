const express = require('express');
const ContactRequest = require('../models/ContactRequest');
const Property = require('../models/Property');
const router = express.Router();

// Contact form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message, propertyId, propertyTitle } = req.body;
        
        // Get property owner
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Create contact request
        const contactRequest = new ContactRequest({
            name, email, phone, message, propertyId, propertyTitle,
            ownerId: property.ownerId
        });
        
        await contactRequest.save();
        res.status(200).json({ message: 'Contact form submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// General contact form (from contact page)
router.post('/general', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Log general contact (in real app, send email to admin)
        // console.log('General contact form:', { name, email, subject, message });
        
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;