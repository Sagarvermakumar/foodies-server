// utils/sendResetLink.js
import crypto from 'crypto'
import { config } from '../config/env.js'
import ResetToken from '../Models/PasswordToken.model.js'
import sendEmail from './sendEmail.js'

export async function sendResetLink(email, subject, expiryMinutes) {
  // Unique token generate
  const token = crypto.randomBytes(32).toString('hex')

  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  // Token DB me save karo
  await ResetToken.create({
    identifier: email,
    token,
    purpose: 'password-reset',
    isUsed: false,
    expiresAt,
  })

  // Password reset link
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${token}`

  // Email send karo
  await sendEmail(
    email,
    subject,
    `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <h2 style="color: #f80; text-align: center; margin-bottom: 15px;">${subject}</h2>
  <p style="color: #555; font-size: 14px; line-height: 1.6; text-align: center;">
    You have requested to reset your password. Click the button below to proceed.
    This link will expire in <b>${expiryMinutes} minutes</b>.
  </p>

  <div style="text-align: center; margin: 25px 0;">
    <a href="${resetUrl}" style="font-size: 16px; font-weight: bold; color: #fff; background: #f80; padding: 12px 25px; border-radius: 6px; text-decoration: none; display: inline-block;">
      Reset Password
    </a>
  </div>

  <p style="color: #888; font-size: 12px; text-align: center;">
    If you did not request this, you can safely ignore this email.
  </p>
</div>

    `
  )

  return token // optional agar controller me use karna ho
}
