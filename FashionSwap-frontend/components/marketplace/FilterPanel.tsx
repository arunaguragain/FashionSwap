"use client";

import React, { useState } from 'react';
import { Button } from '../common/Button';

interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  size?: string;
}

interface FilterPanelProps {
  onFilter: (filters: FilterState) => void;
}

const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function FilterPanel({ onFilter }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <aside className="w-full rounded-[1.5rem] border border-outline/15 bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(27,28,25,0.04)] md:w-64">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Category</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" onChange={(e) => handleFilterChange('category', e.target.checked ? cat : undefined)} className="h-4 w-4 rounded border-outline/30 accent-primary" />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Price range</h3>
          <div className="space-y-2">
            <input type="number" placeholder="Min" onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-2xl border border-outline/30 bg-surface-container-low px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" aria-label="Minimum price" />
            <input type="number" placeholder="Max" onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-2xl border border-outline/30 bg-surface-container-low px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" aria-label="Maximum price" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Condition</h3>
          <div className="space-y-2">
            {conditions.map((cond) => (
              <label key={cond} className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" onChange={(e) => handleFilterChange('condition', e.target.checked ? cond : undefined)} className="h-4 w-4 rounded border-outline/30 accent-primary" />
                <span>{cond}</span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={() => { setFilters({}); onFilter({}); }} variant="secondary" className="w-full">Clear filters</Button>
      </div>
    </aside>
  );
}
