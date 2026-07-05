"use client";

import LoginForm from "../_components/LoginForm";

export default function AdminLoginPage() {
  const handleSubmit = (values: { email: string; password: string }) => {
  };

  return (
    <LoginForm
      userType="Admin"
      onSubmit={handleSubmit}
      registerLink={undefined} 
      forgotPasswordLink="/forgot-password"
      showGoogleSignIn={false}
    />
  );
}