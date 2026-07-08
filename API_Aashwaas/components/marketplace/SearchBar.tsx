"use client";

import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import { Button } from '../common/Button';
import { cn } from '../common/cn';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search items...', className }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => onSearch(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query.trim());
      }}
      className={cn('w-full', className)}
    >
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          aria-label="Search items"
        />
        <Button type="submit" variant="primary">Search</Button>
      </div>
    </form>
  );
}
