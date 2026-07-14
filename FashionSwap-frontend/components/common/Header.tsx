import React from 'react';
import Link from 'next/link';
import { Button } from './Button';

export const Header: React.FC = () => {
  return (
    <header className="w-full sticky top-0 bg-white/60 backdrop-blur-md py-3 shadow-sm z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary-900">FashionSwap</Link>
        <div className="flex items-center gap-3">
          <input placeholder="Search items..." className="hidden md:block rounded-lg border px-3 py-2 w-80" />
          <Button variant="outline">Sign In</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
