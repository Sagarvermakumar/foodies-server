// utils/sendResetLink.js
import { config } from "../config/env.js";
import ResetToken from "../Models/PasswordToken.model.js";
import sendEmail from "./sendEmail.js";
import crypto from "crypto";

export async function sendResetLink(email, subject, expiryMinutes) {
  // Unique token generate
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Token DB me save karo
  await ResetToken.create({
    identifier: email,
    token,
    purpose: "password-reset",
    isUsed:false,
    expiresAt,
  });

  // Password reset link
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

  // Email send karo
  await sendEmail(
    email,
    subject,
    `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #333;">${subject}</h2>
      <p style="color: #555;">
        You have requested to reset your password. Click the link below to proceed.
        This link will expire in <b>${expiryMinutes} minutes</b>.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="font-size: 16px; font-weight: bold; color: #fff; background: #2c3e50; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Reset Password
        </a>
      </div>
      <p style="color: #888; font-size: 12px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
    `
  );

  return token; // optional agar controller me use karna ho
}
