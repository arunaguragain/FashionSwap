"use client";

import React from 'react';
import SearchBar from '../../components/marketplace/SearchBar';
import FilterPanel from '../../components/marketplace/FilterPanel';
import ListingCard from '../../components/marketplace/ListingCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { useEffect, useState } from 'react';
import { getListings } from '../../lib/api';

const mockListings = new Array(6).fill(0).map((_, i) => ({
  id: `listing-${i}`,
  title: `Item ${i + 1}`,
  price: (i + 1) * 10,
  image: '/images/placeholder.png',
  seller: { name: `seller${i + 1}`, rating: 4.5 },
  condition: 'Good',
  category: 'Tops',
}));

export default function ListingsPage() {
  const [items, setItems] = useState<any[]>(mockListings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListings(q);
      setItems(res?.data ?? res ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: any) => {
    console.log('filters', filters);
  };

  useEffect(() => {
    // load initial listings
    handleSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <div className="mb-6"><SearchBar onSearch={handleSearch} /></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1"><FilterPanel onFilter={handleFilter} /></aside>
        <main className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (items.length === 0 ? <div>No listings</div> : items.map((l) => (
            <ListingCard
              key={l.id}
              id={l.id}
              image={l.image}
              title={l.title}
              price={l.price}
              seller={l.seller}
              condition={l.condition}
              category={l.category}
            />
          )))}
        </main>
      </div>
    </div>
  );
}
