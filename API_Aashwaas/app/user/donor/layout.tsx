import { ReactNode } from "react";
import UserSidebar from "../_components/UserSidebar";
import UserHeader from "../_components/UserHeader";

interface DonorLayoutProps {
  children: ReactNode;
}

export default function DonorLayout({ children }: DonorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar userType="donor" />
      <div className="ml-56">
        <UserHeader userType="donor" />
        <main className="p-6 pt-6">{children}</main>
      </div>
    </div>
  );
}
