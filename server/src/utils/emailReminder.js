const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const { sendEmail } = require('./emailService');

// Run daily at 9 AM to check for expiring subscriptions
const scheduleSubscriptionReminders = () => {
    cron.schedule('0 9 * * *', async () => {
        try {
            const fiveDaysFromNow = new Date();
            fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
            
            const expiringSubscriptions = await Subscription.find({
                status: 'active',
                endDate: {
                    $gte: new Date(),
                    $lte: fiveDaysFromNow
                }
            }).populate('ownerId', 'name email');
            
            for (const subscription of expiringSubscriptions) {
                const emailContent = `
                    <h2>Subscription Expiry Reminder</h2>
                    <p>Dear ${subscription.ownerId.name},</p>
                    <p>Your subscription (${subscription.plan}) will expire on ${new Date(subscription.endDate).toLocaleDateString()}.</p>
                    <p>Please renew your subscription to continue using our services.</p>
                    <p>Best regards,<br>PG Management Team</p>
                `;
                
                await sendEmail(
                    subscription.ownerId.email,
                    'Subscription Expiry Reminder',
                    emailContent
                );
            }
            
            console.log(`Sent ${expiringSubscriptions.length} subscription reminders`);
        } catch (error) {
            console.error('Error sending subscription reminders:', error);
        }
    });
};

module.exports = { scheduleSubscriptionReminders };