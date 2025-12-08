const mongoose = require('mongoose');

const accountLockoutSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

accountLockoutSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

accountLockoutSchema.methods.incLoginAttempts = function() {
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { attempts: 1, lastAttempt: Date.now() }
    });
  }
  
  const updates = { $inc: { attempts: 1 }, $set: { lastAttempt: Date.now() } };
  
  if (this.attempts + 1 >= 5 && !this.isLocked) {
    updates.$set.lockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  
  return this.updateOne(updates);
};

module.exports = mongoose.model('AccountLockout', accountLockoutSchema);