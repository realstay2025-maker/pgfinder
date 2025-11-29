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
    // Owner-specific fields
    ownerProfile: {
        companyName: { type: String, trim: true },
        pgCount: { type: Number, default: 0 }
    },
    // Tenant-specific fields
    tenantProfile: {
        pgName: { type: String },
        pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
        phone: { type: String },
        address: { type: String },
        emergencyContact: { type: String },
        occupation: { type: String },
        profileCompleted: { type: Boolean, default: false },
        isAssigned: { type: Boolean, default: false }
    },
    // Security fields
    passwordChangedAt: { type: Date },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isActive: { type: Boolean, default: true }
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