"use client";
import RegsiterForm from "../_components/RegisterForm";
import { RegisterData } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";

export default function VolunteerRegisterPage() {
  const handleSubmit = async (values: RegisterData) => {
    await handleRegister({ ...values, role: "volunteer" });
  };

  return (
    <RegsiterForm
      userType="Volunteer"
      onSubmit={handleSubmit}
      loginLink="/volunteer_login"
    />
  );
}
