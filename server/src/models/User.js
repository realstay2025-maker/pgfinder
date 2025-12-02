// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    // Crucial for Role-Based Access Control (RBAC)
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'pg_owner', 'tenant'],
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: false
    },
    // Owner-specific fields
    ownerProfile: {
        companyName: { type: String, trim: true },
        pgCount: { type: Number, default: 0 },
        // KYC Details
        panNumber: { type: String, trim: true },
        aadhaarNumber: { type: String, trim: true },
        gstNumber: { type: String, trim: true },
        businessAddress: { type: String, trim: true },
        kycDocuments: {
            panCard: { type: String },
            aadhaarCard: { type: String },
            gstCertificate: { type: String },
            businessProof: { type: String }
        },
        kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
        kycSubmittedAt: { type: Date },
        kycVerifiedAt: { type: Date }
    },
    // Tenant-specific fields
    tenantProfile: {
        pgName: { type: String, trim: true },
        isAssigned: { type: Boolean, default: false }
    },
    // Security fields
    passwordChangedAt: { type: Date },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    listingEnabled: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to hash the password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    
    // Set password changed timestamp
    if (this.isModified('password') && !this.isNew) {
        this.passwordChangedAt = new Date();
    }
    
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);