// lib/emailService.js
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "emil00y1demomail@gmail.com",
    pass: process.env.EMAIL_PASSWORD, // Store this in .env file
  },
});

// Function to send verification email
export async function sendVerificationEmail(email, username, otp) {
  try {
    const mailOptions = {
      from: '"Y" <emil00y1demomail@gmail.com>',
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${username}!</h2>
          <p>Thank you for signing up. Please verify your email with the code below:</p>
          <div style="text-align: center; margin: 25px 0;">
            <div style="font-size: 24px; letter-spacing: 8px; font-weight: bold; padding: 15px; background-color: #f0f0f0; border-radius: 5px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't sign up for our service, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}
