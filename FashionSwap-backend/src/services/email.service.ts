import { sendEmail } from '../config/email';

export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  const html = `
    <p>Welcome to FashionSwap!</p>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code is valid for 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Verify your FashionSwap account', html);
}

export async function sendPasswordResetEmail(email: string, otp: string): Promise<void> {
  const html = `
    <p>You requested a password reset for your FashionSwap account.</p>
    <p>Your password reset OTP is: <strong>${otp}</strong></p>
    <p>This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'FashionSwap password reset', html);
}
