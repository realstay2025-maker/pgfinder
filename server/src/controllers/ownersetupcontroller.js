// server/controllers/owner_setup.controller.js
const OwnerPaymentAccount = require('../models/OwnerPaymentAccount');

// Mock function to simulate a Payment Gateway registering an owner
const registerOwnerWithGateway = (details) => {
    // In production, this calls RazorpayX/Stripe API and verifies details
    // Here, we return a mock success
    const uniqueId = `acc_${Math.random().toString(36).substring(2, 15)}`;
    return {
        success: true,
        accountId: uniqueId,
        status: 'pending_verification'
    };
};

// @desc    PG Owner submits bank details for receiving payments
// @route   POST /api/owner/setup/bank
// @access  Private (PG Owner)
exports.saveBankDetails = async (req, res) => {
    const { accountName, accountNumber, ifscCode } = req.body;

    try {
        // 1. Check if the owner has already registered an account
        let existingAccount = await OwnerPaymentAccount.findOne({ ownerId: req.user._id });

        if (existingAccount && existingAccount.status === 'active') {
            return res.status(400).json({ message: 'Bank account is already active and set up.' });
        }
        
        // 2. Register Owner with Payment Gateway (MOCK)
        const gatewayResponse = registerOwnerWithGateway(req.body);

        if (!gatewayResponse.success) {
            return res.status(500).json({ message: 'Failed to register with payment gateway.' });
        }

        // 3. Create or Update OwnerPaymentAccount record in local DB
        const newAccountData = {
            ownerId: req.user._id,
            gatewayAccountId: gatewayResponse.accountId,
            bankDetails: { accountName, accountNumber, ifscCode },
            status: gatewayResponse.status 
        };
        
        if (existingAccount) {
             // If account exists but was pending/rejected, update it
            existingAccount = await OwnerPaymentAccount.findOneAndUpdate(
                { ownerId: req.user._id },
                newAccountData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new account
            existingAccount = new OwnerPaymentAccount(newAccountData);
            await existingAccount.save();
        }

        res.status(200).json({
            message: 'Bank details submitted successfully. Verification pending with the payment provider.',
            account: existingAccount
        });

    } catch (err) {
        console.error("Bank Setup Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate entry detected (Owner ID already linked).' });
        }
        res.status(500).json({ error: 'Failed to save bank details.', details: err.message });
    }
};