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
    if (key === 'category' && value === undefined) {
      delete newFilters.category;
    }
    if (key === 'condition' && value === undefined) {
      delete newFilters.condition;
    }
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
              <button
                key={cat}
                type="button"
                onClick={() => handleFilterChange('category', filters.category === cat ? undefined : cat)}
                className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${filters.category === cat ? 'border-terracotta bg-terracotta/10 text-charcoal' : 'border-outline/30 bg-surface-container text-on-surface-variant hover:border-terracotta/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Price range</h3>
          <div className="space-y-2">
            <input type="number" placeholder="Min" value={filters.minPrice ?? ''} onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-2xl border border-outline/30 bg-surface-container-low px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" aria-label="Minimum price" />
            <input type="number" placeholder="Max" value={filters.maxPrice ?? ''} onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-2xl border border-outline/30 bg-surface-container-low px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" aria-label="Maximum price" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Condition</h3>
          <div className="space-y-2">
            {conditions.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => handleFilterChange('condition', filters.condition === cond ? undefined : cond)}
                className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${filters.condition === cond ? 'border-terracotta bg-terracotta/10 text-charcoal' : 'border-outline/30 bg-surface-container text-on-surface-variant hover:border-terracotta/50'}`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => { setFilters({}); onFilter({}); }} variant="secondary" className="w-full">Clear filters</Button>
      </div>
    </aside>
  );
}
