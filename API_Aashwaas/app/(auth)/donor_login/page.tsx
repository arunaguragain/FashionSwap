"use client";

import LoginForm from "../_components/LoginForm";

export default function DonorLoginPage() {
  const handleSubmit = (values: { email: string; password: string }) => {
  };

  return (
    <LoginForm
      userType="Donor"
      onSubmit={handleSubmit}
      registerLink="/donor_register"
      forgotPasswordLink="/forgot-password"
      showGoogleSignIn={true}
    />
  );
}