import OTP from "../Models/OTP.model.js";
import { generateOtp } from "./helper.js";
import sendEmail from '../Utils/sendEmail.js'

export async function sendOtp(email, subject, expiryMinutes) {
  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await OTP.create({ identifier:email, otp: otpCode, purpose:"login",expiresAt });

  await sendEmail(email, subject,  `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #333;">${subject}</h2>
    <p style="color: #555;">
      You have requested to reset your password. Use the OTP below to proceed. 
      This OTP will expire in <b>10 minutes</b>.
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #2c3e50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
        ${otpCode}
      </span>
    </div>
    <p style="color: #888; font-size: 12px;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
  `);
}
