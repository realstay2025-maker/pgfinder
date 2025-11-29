const validator = require('validator');

const validatePassword = (password) => {
    const errors = [];
    
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(input.trim());
};

const validateEmail = (email) => {
    return validator.isEmail(email);
};

const validateObjectId = (id) => {
    return validator.isMongoId(id);
};

module.exports = {
    validatePassword,
    sanitizeInput,
    validateEmail,
    validateObjectId
};