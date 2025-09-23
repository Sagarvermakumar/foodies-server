import OTP from '../Models/OTP.model.js'
import sendEmail from '../Utils/sendEmail.js'
import { generateOtp } from './helper.js'

export async function sendOtp(email, subject, expiryMinutes) {
  const otpCode = generateOtp()
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  await OTP.create({
    identifier: email,
    otp: otpCode,
    purpose: 'login',
    expiresAt,
  })

  await sendEmail(
    email,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <h2 style="color: #f80; text-align: center; margin-bottom: 15px;">${subject}</h2>
  <p style="color: #555; font-size: 14px; line-height: 1.6; text-align: center;">
    You have requested to reset your password. Use the OTP below to proceed. 
    This OTP will expire in <b>10 minutes</b>.
  </p>

  <div style="text-align: center; margin: 25px 0;">
    <span id="otp-code" style="font-size: 36px; letter-spacing: 5px; font-weight: bold; color: #f80; background: #f4f4f4; padding: 12px 25px; border-radius: 6px; display: inline-block;">
      ${otpCode}
    </span>
    <br/>
    
  </div>

  <p style="color: #888; font-size: 12px; text-align: center;">
    If you did not request this, you can safely ignore this email.
  </p>


</div>
 `
  )
}
