const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limit
exports.generalLimiter = createRateLimit(15 * 60 * 1000, 100, 'Too many requests');

// Auth rate limit
exports.authLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts');

// File upload rate limit
exports.uploadLimiter = createRateLimit(60 * 60 * 1000, 10, 'Too many file uploads');

// Security middleware
exports.securityMiddleware = [
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'"],
            },
        },
    }),
    mongoSanitize(),
    xss(),
    hpp(),
];