"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, User, Plus, Menu, X, Package } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { label: "Browse", href: "/listings" },
  { label: "Clothes", href: "/listings?cat=clothes" },
  { label: "Bags", href: "/listings?cat=bags" },
  { label: "Shoes", href: "/listings?cat=shoes" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || "/";

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/mfa-");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  if (isAuthPage) {
    return <main className="flex-1 min-h-screen bg-parchment">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              <Link href="/saved" className="p-2 text-ink hover:text-charcoal rounded-lg hover:bg-parchment-dark transition-colors">
                <Heart size={18} />
              </Link>
              <Link href="/orders" className="p-2 text-ink hover:text-charcoal rounded-lg hover:bg-parchment-dark transition-colors">
                <Package size={18} />
              </Link>
              <Link href="/profile" className="p-2 text-ink hover:text-charcoal rounded-lg hover:bg-parchment-dark transition-colors">
                <User size={18} />
              </Link>
              <Link
                href="/listing/create"
                className="ml-2 flex items-center gap-1.5 bg-terracotta text-white text-sm font-medium px-4 py-2 rounded-[10px] hover:bg-terracotta-dark transition-colors"
              >
                <Plus size={15} />
                Sell
              </Link>
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
            <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
              <Link href="/saved" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                <Heart size={16} /> Saved
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                <Package size={16} /> Orders
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-ink">
                <User size={16} /> Profile
              </Link>
            </div>
            <Link
              href="/listing/create"
              onClick={() => setMenuOpen(false)}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-terracotta text-white py-3 rounded-[12px] font-medium"
            >
              <Plus size={16} /> List an Item
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-charcoal text-parchment/70 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
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
                {["Sell an Item", "My Orders", "Saved Items", "Settings", "Help"].map((item) => (
                  <li key={item}>
                    <span className="hover:text-parchment cursor-pointer transition-colors">{item}</span>
                  </li>
                ))}
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
