import { createTransport, getTestMessageUrl } from "nodemailer";
import { config } from "../config/env.js";

const transport = createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: true,
  auth: {
    user: config.EMAIL.user,
    pass: config.EMAIL.pass,
  },
});

export default async function sendEmail(to, subject, html) {
  try {
    await transport.sendMail({
      from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
