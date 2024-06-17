import { EventEmitter } from 'node:events';
import { sendEmail } from '../libs/utils';

const userEventEmitter = new EventEmitter();

userEventEmitter.on('registerEmail', async (email : string, activationCode : string) => {
    await sendEmail({
        email: email,
        subject: 'Activate Your Account',
        text: 'Please use the following code to activate your account: ' + activationCode,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4CAF50;">Activate Your Account</h2>
            <p>Please use the following code to activate your account:</p>
            <div style="border: 1px solid #ddd; padding: 10px; font-size: 20px; margin-top: 20px; text-align: center;">
              <strong>${activationCode}</strong>
            </div>
            <p>If you did not request this code, please ignore this email or contact our support team.</p>
            <p>Best regards,<br>The Support Team</p>
          </div>
        `
      });
});

export default userEventEmitter;