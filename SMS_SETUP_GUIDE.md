# SMS Setup Guide for EV Secure Dashboard

This guide will help you set up real SMS functionality for OTP delivery using Twilio.

## Prerequisites

1. A Twilio account (free trial available)
2. A valid phone number for receiving SMS

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your phone number
4. Complete the account setup

## Step 2: Get Twilio Credentials

1. Log in to your Twilio Console: [https://console.twilio.com/](https://console.twilio.com/)
2. On the dashboard, you'll find:
   - **Account SID**: Copy this value
   - **Auth Token**: Click to reveal and copy this value

## Step 3: Purchase a Phone Number

1. In the Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose a phone number that supports SMS
3. Complete the purchase (free trial includes $15 credit)

## Step 4: Configure Environment Variables

1. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Twilio credentials:
   ```env
   # JWT Secret for authentication
   JWT_SECRET=your-secret-key-change-in-production

   # Twilio Configuration for SMS
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## Step 5: Test SMS Functionality

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to the login page and click "Forgot Password"
3. Enter a valid phone number
4. Check your phone for the SMS with the OTP

## Troubleshooting

### SMS Not Received
- Check that your Twilio phone number is correct
- Verify the destination phone number format (should include country code)
- Check Twilio Console for delivery status
- Ensure you have sufficient Twilio credits

### Error Messages
- **"Invalid phone number"**: Ensure the phone number includes country code (+91 for India)
- **"Failed to send SMS"**: Check Twilio credentials and phone number configuration
- **"Account not found"**: Verify the Account SID is correct

### Free Trial Limitations
- Twilio free trial has limitations on phone numbers and SMS destinations
- You can only send SMS to verified phone numbers during the trial
- Add your phone number to verified numbers in Twilio Console

## Alternative SMS Providers

If you prefer other SMS providers, you can modify the `sendOTP` function in `app/api/auth/route.ts`:

### AWS SNS
```javascript
import AWS from 'aws-sdk'

const sns = new AWS.SNS({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

// In sendOTP function
const params = {
  Message: `Your EV Secure OTP is: ${otp}`,
  PhoneNumber: phoneNumber
}
await sns.publish(params).promise()
```

### Indian SMS Providers
- **MSG91**: Popular in India, good rates
- **TextLocal**: Easy integration
- **Fast2SMS**: Cost-effective option

## Security Notes

1. Never commit `.env.local` to version control
2. Use environment variables for all sensitive data
3. Consider rate limiting for OTP requests
4. Implement OTP expiration (currently set to 10 minutes)
5. Log SMS delivery status for monitoring

## Production Considerations

1. **Database**: Replace in-memory storage with a real database
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **Monitoring**: Set up monitoring for SMS delivery rates
4. **Backup Provider**: Have a backup SMS provider for reliability
5. **Cost Management**: Monitor SMS costs and implement usage limits

## Support

If you encounter issues:
1. Check the Twilio Console for error logs
2. Verify your environment variables
3. Test with a simple phone number first
4. Check the browser console for any frontend errors
