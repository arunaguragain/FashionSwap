"use client";

import RegsiterForm from "../_components/RegisterForm";

export default function DonorRegisterPage() {
  const handleSubmit = (values: any) => {
  };

  return (
    <RegsiterForm
      userType="Donor"
      onSubmit={handleSubmit}
      loginLink="/donor_login"
    />
  );
}
