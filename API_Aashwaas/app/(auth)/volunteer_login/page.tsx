"use client";

import LoginForm from "../_components/LoginForm";

export default function VolunteerLoginPage() {
  const handleSubmit = (values: { email: string; password: string }) => {
  };

  return (
    <LoginForm
      userType="Volunteer"
      onSubmit={handleSubmit}
      registerLink="/volunteer_register"
      forgotPasswordLink="/forgot-password"
      showGoogleSignIn={true}
    />
  );
}