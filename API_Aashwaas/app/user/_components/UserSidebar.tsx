"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-actions";
import {
  LayoutDashboard,
  Package,
  Building2,
  ClipboardList,
  Star,
  User,
  Settings,
  LogOut,
  PlusCircle,
} from "lucide-react";

interface UserSidebarProps {
  userType: "donor" | "volunteer";
}

const navItemsDonor = [
  { href: "/user/donor/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/user/donor/my-donations", label: "My Donations", icon: Package },
  { href: "/user/donor/donation", label: "Add Donation", icon: PlusCircle },
  { href: "/user/donor/ngos", label: "NGO Directory", icon: Building2 },
  { href: "/user/donor/wishlist", label: "Wishlist", icon: ClipboardList },
  { href: "/user/donor/reviews", label: "Reviews", icon: Star },
];

const navItemsVolunteer = [
  { href: "/user/volunteer/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/user/volunteer/my-tasks", label: "My Tasks", icon: ClipboardList },
  { href: "/user/volunteer/ngos", label: "NGO Directory", icon: Building2 },
  { href: "/user/volunteer/reviews", label: "Reviews", icon: Star },
];

const UserSidebar: React.FC<UserSidebarProps> = ({ userType }) => {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = userType === "donor" ? navItemsDonor : navItemsVolunteer;

  const onLogout = async () => {
    const res = await handleLogout();
    if (res.success) {
      router.push(userType === "donor" ? "/donor_login" : "/volunteer_login");
      return;
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-55 flex-col border-r border-gray-200 bg-white">
      <div className="px-4 py-5">
        <div className="flex flex-col items-start">
          <Image
            src="/images/logo.png"
            alt="Aashwaas"
            width={150}
            height={40}
            className="h-12 w-full max-w-[150px] object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 px-5">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-2 pb-6">
        <div className="border-t border-gray-200 pt-4" />
        <div className="space-y-1">
          <Link
            href={userType === "donor" ? "/user/donor/profile" : "/user/volunteer/profile"}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
