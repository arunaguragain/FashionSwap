"use client";

import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import { Button } from '../common/Button';
import { cn } from '../common/cn';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search items...', className }: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const id = setTimeout(() => onSearch(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(query.trim()); }} className={cn('w-full', className)}>
      <div className="flex gap-2 rounded-[1.5rem] border border-outline/15 bg-surface-container-lowest p-2 shadow-[0_8px_24px_rgba(27,28,25,0.04)]">
        <div className="flex flex-1 items-center gap-2 rounded-[1rem] border border-outline/15 bg-surface-container-low px-3 py-2">
          <Search className="h-4 w-4 text-primary" />
          <Input type="search" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} className="border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0" aria-label="Search items" />
        </div>
        <Button type="submit" variant="primary" className="px-4">Search</Button>
      </div>
    </form>
  );
}
