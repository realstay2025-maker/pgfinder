const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'dummy@gmail.com',
        pass: process.env.EMAIL_PASS || 'dummy-password'
    }
});

const sendTenantCredentials = async (email, name, password) => {
    // Check if email is properly configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
        // console.log('Email not configured - skipping email send');
        return Promise.resolve({ message: 'Email skipped - not configured' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'PG Booking Approved - Login Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">🎉 Booking Approved!</h2>
                <p>Dear ${name},</p>
                <p>Congratulations! Your PG booking has been approved by the owner.</p>
                <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> <code style="background: #E5E7EB; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
                </div>
                <p>Please login to your tenant dashboard to complete your profile and access all features.</p>
                <p><strong>Important:</strong> Please change your password after first login for security.</p>
                <br>
                <p>Best regards,<br>PG Management Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendPaymentReminder = async (email, name, propertyTitle, amount, dueDate) => {
    // Check if email is properly configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
        // console.log('Email not configured - skipping payment reminder');
        return Promise.resolve({ message: 'Email skipped - not configured' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Payment Reminder - PG Rent Due',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #DC2626;">💰 Payment Reminder</h2>
                <p>Dear ${name},</p>
                <p>This is a friendly reminder that your rent payment is due for <strong>${propertyTitle}</strong>.</p>
                <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #DC2626; margin-top: 0;">Payment Details:</h3>
                    <p><strong>Property:</strong> ${propertyTitle}</p>
                    <p><strong>Amount Due:</strong> ₹${amount}</p>
                    <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                </div>
                <p>Please make the payment at your earliest convenience to avoid any late fees.</p>
                <p>If you have already made the payment, please ignore this reminder.</p>
                <br>
                <p>Best regards,<br>PG Management Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendTenantCredentials, sendPaymentReminder };