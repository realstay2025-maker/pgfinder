const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        checks: {
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        }
    };

    try {
        res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.message = error;
        res.status(503).json(healthCheck);
    }
});

// Readiness probe
router.get('/ready', (req, res) => {
    if (mongoose.connection.readyState === 1) {
        res.status(200).json({ status: 'ready' });
    } else {
        res.status(503).json({ status: 'not ready' });
    }
});

// Liveness probe
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

module.exports = router;