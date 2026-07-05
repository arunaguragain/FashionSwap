"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface UserHeaderProps {
  userType: "donor" | "volunteer";
}

const UserHeader: React.FC<UserHeaderProps> = ({ userType }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-4 text-sm font-medium text-gray-600 lg:flex">
            <div className="hidden lg:flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                <img
                  src={
                    user?.profilePicture
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050'}/item_photos/${user.profilePicture}`
                      : user?.avatar
                        ? user.avatar
                        : '/images/user.png'
                  }
                  alt={user?.name ?? 'avatar'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-sm text-gray-700">
                <span className="font-medium">Hello, {user?.name ?? user?.fullName ?? user?.username ?? (userType === "donor" ? "Donor" : "Volunteer")}</span>
                <span className="text-xs text-gray-500">{user?.email ?? ''}</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl px-2">
            <form onSubmit={(e) => {
              e.preventDefault();
              const next = query.trim();
              const lc = next.toLowerCase();
              let target: string | null = null;
              if (!lc) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('q');
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname);
                return;
              }

              // Map common keywords to actual routes used in this app
              if (lc === 'dashboard' || lc.includes('dash')) target = `/user/${userType}/dashboard`;
              else if (lc.includes('donat')) {
                // donations are only for donors; for volunteers fall back to dashboard/search
                target = userType === 'donor' ? `/user/${userType}/my-donations` : `/user/${userType}/dashboard`;
              } else if (lc.includes('ngo')) target = `/user/${userType}/ngos`;
              else if (lc.includes('task')) target = `/user/${userType}/my-tasks`;
              else if (lc.includes('history')) target = `/user/${userType}/history`;
              else if (lc.includes('wishlist')) target = `/user/donor/wishlist`;
              else if (lc.includes('review') || lc.includes('reviews')) target = `/user/${userType}/reviews`;
              else if (lc.includes('profile')) target = `/user/${userType}/profile`;

              if (target) {
                const url = `${target}?q=${encodeURIComponent(next)}`;
                router.push(url);
              } else {
                const params = new URLSearchParams(searchParams.toString());
                params.set('q', next);
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname);
              }
            }}>
              <label className="relative block">
                <span className="sr-only">Search</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300"
                  placeholder="Search donations, NGOs, tasks..."
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
