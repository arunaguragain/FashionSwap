import { ReactNode } from "react";
import UserSidebar from "../_components/UserSidebar";
import UserHeader from "../_components/UserHeader";

interface VolunteerLayoutProps {
  children: ReactNode;
}

export default function VolunteerLayout({ children }: VolunteerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar userType="volunteer" />
      <div className="ml-56">
        <UserHeader userType="volunteer" />
        <main className="p-6 pt-6">{children}</main>
      </div>
    </div>
  );
}
