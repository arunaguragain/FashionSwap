"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, User, Plus, Menu, X, Package, LogOut, Settings, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Browse", href: "/listings" },
  { label: "Clothes", href: "/listings?cat=clothes" },
  { label: "Bags", href: "/listings?cat=bags" },
  { label: "Shoes", href: "/listings?cat=shoes" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { isAuthenticated, user, logout, loading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname.startsWith("/mfa-");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isAuthPage) {
    return <main className="flex-1 min-h-screen bg-parchment">{children}</main>;
  }

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.fullName || "User");
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              <Logo size="sm" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-terracotta"
                      : "text-ink hover:text-charcoal"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/listings" className="p-2 text-ink hover:text-charcoal rounded-lg hover:bg-parchment-dark transition-colors">
                <Search size={18} />
              </Link>

              {!loading && isAuthenticated ? (
                <>
                  <Link href="/saved" className="p-2 text-ink hover:text-charcoal rounded-lg hover:bg-parchment-dark transition-colors">
                    <Heart size={18} />
                  </Link>
                  <Link href="/orders" className="p-2 text-ink hover:text-charcoal rounded-lg hover:bg-parchment-dark transition-colors">
                    <Package size={18} />
                  </Link>

                  {/* User dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-parchment-dark transition-colors"
                    >
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-terracotta text-white text-xs font-bold">
                        {userInitial}
                      </span>
                      <ChevronDown size={14} className={`text-ink transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white shadow-lg ring-1 ring-black/5 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-border/60">
                          <p className="text-sm font-semibold text-charcoal truncate">{userName}</p>
                          <p className="text-xs text-ink truncate mt-0.5 capitalize">{user?.role || 'User'}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-soft hover:bg-parchment-dark transition-colors"
                        >
                          <User size={15} className="text-ink" /> My Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-soft hover:bg-parchment-dark transition-colors"
                        >
                          <Settings size={15} className="text-ink" /> Settings
                        </Link>
                        <div className="border-t border-border/60 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/listing/create"
                    className="ml-2 flex items-center gap-1.5 bg-terracotta text-white text-sm font-medium px-4 py-2 rounded-[10px] hover:bg-terracotta-dark transition-colors"
                  >
                    <Plus size={15} />
                    Sell
                  </Link>
                </>
              ) : !loading ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-charcoal-soft hover:text-charcoal transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 bg-terracotta text-white text-sm font-medium px-4 py-2 rounded-[10px] hover:bg-terracotta-dark transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : null}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-charcoal"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-parchment px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-[15px] font-medium text-charcoal"
              >
                {link.label}
              </Link>
            ))}

            {!loading && isAuthenticated ? (
              <>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-3 px-1 py-2 mb-2">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-terracotta text-white text-sm font-bold">
                      {userInitial}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{userName}</p>
                      <p className="text-xs text-ink capitalize">{user?.role || 'User'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/saved" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                    <Heart size={16} /> Saved
                  </Link>
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                    <Package size={16} /> Orders
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                    <User size={16} /> Profile
                  </Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                    <Settings size={16} /> Settings
                  </Link>
                </div>
                <Link
                  href="/listing/create"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-terracotta text-white py-3 rounded-[12px] font-medium"
                >
                  <Plus size={16} /> List an Item
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-3 rounded-[12px] font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : !loading ? (
              <div className="pt-3 border-t border-border space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 border border-border text-charcoal font-medium rounded-[12px] hover:bg-parchment-dark transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 bg-terracotta text-white font-medium rounded-[12px] hover:bg-terracotta-dark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-charcoal text-parchment/70 mt-16">
        <div className="w-full px-6 py-12 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="sm" variant="light" />
              <p className="mt-3 text-sm leading-relaxed text-parchment/60 max-w-sm">
                Nepal's conscious fashion marketplace — buy and sell pre-loved clothes, bags, and shoes directly with each other.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-parchment mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                {["Browse All", "Clothes", "Bags", "Shoes", "New Arrivals"].map((item) => (
                  <li key={item}>
                    <Link href="/listings" className="hover:text-parchment transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-parchment mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listing/create" className="hover:text-parchment transition-colors">Sell an Item</Link></li>
                <li><Link href="/orders" className="hover:text-parchment transition-colors">My Orders</Link></li>
                <li><Link href="/saved" className="hover:text-parchment transition-colors">Saved Items</Link></li>
                <li><Link href="/settings" className="hover:text-parchment transition-colors">Settings</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-parchment/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-parchment/40">
            <span>© 2025 FashionSwap. Made in Nepal.</span>
            <div className="flex gap-4">
              <span className="hover:text-parchment/70 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-parchment/70 cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
