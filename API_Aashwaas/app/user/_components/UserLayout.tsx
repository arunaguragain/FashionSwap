"use client";

import { ReactNode } from "react";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

interface UserLayoutProps {
  children: ReactNode;
  userType: "donor" | "volunteer";
  userName?: string;
}

const SIDEBAR_WIDTH = 220; // px, matches w-55 (55*4)
const UserLayout = ({ children, userType, userName }: UserLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar userType={userType} />
      <div
        className="flex flex-col min-h-screen"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <UserHeader userType={userType} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
