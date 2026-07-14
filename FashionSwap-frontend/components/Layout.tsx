"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, User, Plus, Menu, X, Package } from 'lucide-react';
import Logo from './Logo';

const navLinks = [
  { label: 'Browse', href: '/listings' },
  { label: 'Clothes', href: '/listings?category=clothes' },
  { label: 'Bags', href: '/listings?category=bags' },
  { label: 'Shoes', href: '/listings?category=shoes' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || '/';
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]));

  return (
    <div className="min-h-screen flex flex-col bg-parchment page-surface">
      <header className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-outline/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              <Logo size="sm" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/listings" className="p-2 text-on-surface hover:text-on-surface-variant rounded-lg">
                <Search className="h-4 w-4" />
              </Link>
              <Link href="/saved" className="p-2 text-on-surface hover:text-on-surface-variant rounded-lg">
                <Heart className="h-4 w-4" />
              </Link>
              <Link href="/orders" className="p-2 text-on-surface hover:text-on-surface-variant rounded-lg">
                <Package className="h-4 w-4" />
              </Link>
              <Link href="/profile" className="p-2 text-on-surface hover:text-on-surface-variant rounded-lg">
                <User className="h-4 w-4" />
              </Link>
              <Link href="/listing/create" className="ml-2 flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-[10px] hover:opacity-95">
                <Plus className="h-4 w-4" />
                Sell
              </Link>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-on-surface">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-outline/15 bg-parchment px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-base font-medium text-on-surface">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-outline/15 grid grid-cols-2 gap-2">
              <Link href="/saved" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-on-surface">Saved</Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-on-surface">Orders</Link>
            </div>
            <Link href="/listing/create" onClick={() => setMenuOpen(false)} className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-[12px] font-medium">List an Item</Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-on-surface text-on-surface-variant mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="sm" variant="light" />
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant max-w-sm">Nepal's conscious fashion marketplace — buy and sell pre-loved clothes, bags, and shoes directly with each other.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                {['Browse All', 'Clothes', 'Bags', 'Shoes', 'New Arrivals'].map((item) => (
                  <li key={item}><Link href="/listings" className="hover:text-on-surface transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                {['Sell an Item', 'My Orders', 'Saved Items', 'Settings', 'Help'].map((item) => (
                  <li key={item}><span className="hover:text-on-surface cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-on-surface-variant/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-on-surface-variant">
            <span>© 2025 FashionSwap. Made in Nepal.</span>
            <div className="flex gap-4">
              <span className="hover:text-on-surface/70 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-on-surface/70 cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
