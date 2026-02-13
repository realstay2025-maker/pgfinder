const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const AccountLockout = require('../models/AccountLockout');
const Session = require('../models/Session');
const { sendEmail } = require('../utils/emailService');
const { encrypt } = require('../utils/encryption');

// Original functions for backward compatibility
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, gender, pgName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const encryptedPhone = phone ? encrypt(phone) : null;

    const userObject = {
      name,
      email,
      password: hashedPassword,
      role: role || 'tenant',
      phone: encryptedPhone,
      gender,
      tenantProfile: {
        pgName: role === 'tenant' ? (pgName || '') : '',
        isAssigned: false
      }
    };

    const user = new User(userObject);
    await user.save();

    console.log('User registered with pgName:', { pgName: user.tenantProfile.pgName });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      pgName: user.tenantProfile.pgName || ''
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const lockout = await AccountLockout.findOne({ email });
    if (lockout && lockout.isLocked) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed attempts. Try again later.' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      if (lockout) {
        await lockout.incLoginAttempts();
      } else {
        await AccountLockout.create({ email, attempts: 1 });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (lockout) {
        await lockout.incLoginAttempts();
      } else {
        await AccountLockout.create({ email, attempts: 1 });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (lockout) {
      await AccountLockout.deleteOne({ email });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender
      // user: {
      //   id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   role: user.role,
      //   gender: user.gender
      // }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const promoteToAdmin = async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Invalid admin key' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.role = 'admin';
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Promoted to admin successfully',
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
      // user: {
      //   id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   role: user.role
      // }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    await Session.updateMany(
      { userId: user._id },
      { isActive: false }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, gender, pgName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Encrypt sensitive data
    const encryptedPhone = phone ? encrypt(phone) : null;

    const userObject = {
      name,
      email,
      password: hashedPassword,
      role: role || 'tenant',
      phone: encryptedPhone,
      gender,
      tenantProfile: {
        pgName: role === 'tenant' ? (pgName || '') : '',
        isAssigned: false
      }
    };

    const user = new User(userObject);
    await user.save();

    console.log('User registered with pgName:', { pgName: user.tenantProfile.pgName });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session
    await Session.create({
      userId: user._id,
      token,
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        device: req.get('User-Agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: req.get('User-Agent')?.split(' ')[0]
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        pgName: user.tenantProfile.pgName || ''
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check account lockout
    const lockout = await AccountLockout.findOne({ email });
    if (lockout && lockout.isLocked) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed attempts. Try again later.' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Increment failed attempts even for non-existent users
      if (lockout) {
        await lockout.incLoginAttempts();
      } else {
        await AccountLockout.create({ email, attempts: 1 });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      if (lockout) {
        await lockout.incLoginAttempts();
      } else {
        await AccountLockout.create({ email, attempts: 1 });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset lockout on successful login
    if (lockout) {
      await AccountLockout.deleteOne({ email });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session
    await Session.create({
      userId: user._id,
      token,
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        device: req.get('User-Agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: req.get('User-Agent')?.split(' ')[0]
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    await PasswordReset.create({
      userId: user._id,
      token: resetToken
    });

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    await User.findByIdAndUpdate(resetRecord.userId, {
      password: hashedPassword
    });

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Invalidate all sessions for this user
    await Session.updateMany(
      { userId: resetRecord.userId },
      { isActive: false }
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      await Session.findOneAndUpdate(
        { token },
        { isActive: false }
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.id,
      isActive: true
    }).select('-token').sort({ lastActivity: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await Session.findOneAndUpdate(
      { _id: sessionId, userId: req.user.id },
      { isActive: false }
    );

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getSessions,
  revokeSession,
  registerUser,
  loginUser,
  promoteToAdmin,
  changePassword
};