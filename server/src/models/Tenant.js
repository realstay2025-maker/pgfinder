// server/models/Tenant.js
const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    bedId: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Phone number must be a valid 10-digit Indian mobile number'
        }
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        minlength: [10, 'Address must be at least 10 characters']
    },
    permanentAddress: {
        type: String,
        required: true,
        minlength: [10, 'Permanent address must be at least 10 characters']
    },
    emergencyContact: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Emergency contact must be a valid 10-digit mobile number'
        }
    },
    occupation: {
        type: String,
        required: true,
        minlength: [2, 'Occupation must be at least 2 characters']
    },
    occupationType: {
        type: String,
        enum: ['working', 'student'],
        default: 'working'
    },
    companyName: {
        type: String,
        validate: {
            validator: function(v) {
                return this.occupationType !== 'working' || (v && v.trim().length >= 2);
            },
            message: 'Company name is required for working professionals'
        }
    },
    collegeName: {
        type: String,
        validate: {
            validator: function(v) {
                return this.occupationType !== 'student' || (v && v.trim().length >= 2);
            },
            message: 'College name is required for students'
        }
    },
    aadhaarNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{12}$/.test(v);
            },
            message: 'Aadhaar number must be exactly 12 digits'
        },
        unique: true
    },
    // New fields from profile form
    dateOfBirth: {
        type: Date
    },
    age: {
        type: Number
    },
    bloodGroup: {
        type: String,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    },
    panNumber: {
        type: String
    },
    // Academic/Employment
    institute: {
        type: String
    },
    designation: {
        type: String
    },
    collegeCompanyId: {
        type: String
    },
    institutionAddress: {
        type: String
    },
    // Emergency Contact
    emergencyContactName: {
        type: String
    },
    relationship: {
        type: String
    },
    emergencyMobile1: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^[6-9]\d{9}$/.test(v);
            },
            message: 'Emergency mobile must be a valid 10-digit number'
        }
    },
    emergencyMobile2: {
        type: String
    },
    // Medical Information
    medicalConditions: {
        type: String
    },
    allergies: {
        type: String
    },
    regularMedication: {
        type: String
    },
    // Document Submission Flags
    aadhaarCardSubmitted: {
        type: Boolean,
        default: false
    },
    panCardSubmitted: {
        type: Boolean,
        default: false
    },
    collegeIdSubmitted: {
        type: Boolean,
        default: false
    },
    photographsSubmitted: {
        type: Boolean,
        default: false
    },
    documents: {
        aadhaarCard: {
            type: String // File path
        },
        photo: {
            type: String // File path
        },
        panCard: {
            type: String
        },
        collegeId: {
            type: String
        },
        photographs: {
            type: String
        }
    },
    rent: {
        type: Number
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    moveOutDate: {
        type: Date
    },
    vacateDate: {
        type: Date
    },
    profileCompletedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['profile_incomplete', 'profile_completed', 'active', 'notice', 'moved_out'],
        default: 'profile_incomplete'
    },
    // History tracking
    rentHistory: [{
        amount: Number,
        effectiveDate: Date,
        reason: String
    }],
    statusHistory: [{
        status: String,
        date: Date,
        reason: String
    }]
}, { timestamps: true });

// Index for efficient queries
TenantSchema.index({ propertyId: 1, status: 1 });
TenantSchema.index({ roomId: 1, status: 1 });

module.exports = mongoose.model('Tenant', TenantSchema);