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
    <aside className="w-full md:w-64 space-y-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleFilterChange('category', e.target.checked ? cat : undefined)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min"
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Minimum price"
          />
          <input
            type="number"
            placeholder="Max"
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleFilterChange('condition', e.target.checked ? cond : undefined)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{cond}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={() => {
          setFilters({});
          onFilter({});
        }}
        variant="secondary"
        className="w-full"
      >
        Clear Filters
      </Button>
    </aside>
  );
}
