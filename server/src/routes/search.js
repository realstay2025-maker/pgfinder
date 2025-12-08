const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    searchProperties,
    getNearbyServices,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    getRecommendations,
    getPropertyAlerts,
    markAlertAsRead
} = require('../controllers/searchcontroller');

// Public routes
router.get('/properties', searchProperties);
router.get('/nearby-services', getNearbyServices);

// Protected routes (require authentication)
router.post('/save', protect, saveSearch);
router.get('/saved', protect, getSavedSearches);
router.delete('/saved/:id', protect, deleteSavedSearch);
router.get('/recommendations', protect, getRecommendations);
router.get('/alerts', protect, getPropertyAlerts);
router.put('/alerts/:id/read', protect, markAlertAsRead);

module.exports = router;