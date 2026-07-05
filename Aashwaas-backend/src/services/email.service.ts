export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  console.log(` Verification email to ${email}: OTP = ${otp}`);
}

export async function sendPasswordResetEmail(email: string, otp: string): Promise<void> {
  console.log(` Password reset email to ${email}: OTP = ${otp}`);
}
