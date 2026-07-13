export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  console.log(`Verification email queued for ${email}`);
}

export async function sendPasswordResetEmail(email: string, otp: string): Promise<void> {
  console.log(`Password reset email queued for ${email}`);
}
