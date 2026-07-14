"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SearchBar from '../../components/marketplace/SearchBar';
import FilterPanel from '../../components/marketplace/FilterPanel';
import ListingCard from '../../components/marketplace/ListingCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { getListings } from '../../lib/api';

interface ListingItem {
  _id?: string;
  id?: string;
  title: string;
  askingPrice?: number;
  price?: number;
  images?: string[];
  image?: string;
  sellerName?: string;
  seller?: { name?: string; rating?: number };
  condition?: string;
  category?: string;
  description?: string;
}

export default function ListingsPage() {
  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<{ category?: string; minPrice?: number; maxPrice?: number; condition?: string; size?: string }>({});

  const loadListings = useCallback(async (search = '', currentFilters: { category?: string; minPrice?: number; maxPrice?: number; condition?: string; size?: string } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListings(search, currentFilters);
      const payload = (res as any)?.data ?? res ?? [];
      setItems(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load listings');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    await loadListings(q, filters);
  };

  const handleFilter = (nextFilters: { category?: string; minPrice?: number; maxPrice?: number; condition?: string; size?: string }) => {
    setFilters(nextFilters);
    void loadListings(query, nextFilters);
  };

  useEffect(() => {
    void loadListings('', {});
  }, [loadListings]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      );
    }

    if (error) {
      return <div className="rounded-[1.5rem] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>;
    }

    if (items.length === 0) {
      return (
        <div className="rounded-[1.5rem] border border-dashed border-outline/30 bg-surface-container-low p-8 text-sm text-on-surface-variant md:col-span-3">
          <p className="font-semibold text-on-surface">No listings match your search yet.</p>
          <p className="mt-2">Try a broader keyword or clear a filter to see more fashion pieces.</p>
        </div>
      );
    }

    return items.map((l) => {
      const id = l._id || l.id;
      const image = l.images?.[0] || l.image || '/images/placeholder.png';
      const sellerName = l.seller?.name || l.sellerName || 'seller';
      const price = l.askingPrice ?? l.price ?? 0;
      return (
        <ListingCard key={id} id={String(id)} image={image} title={l.title} price={price} seller={{ name: sellerName, rating: l.seller?.rating }} condition={l.condition} category={l.category} />
      );
    });
  }, [error, items, loading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-5 shadow-[0_12px_40px_rgba(27,28,25,0.06)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Marketplace</p>
            <h1 className="mt-2 font-headline text-3xl text-on-surface">Discover pieces worth keeping.</h1>
            <p className="mt-2 text-sm leading-7 text-on-surface-variant">Browse the latest pre-loved fashion with a calm, editorial feel.</p>
          </div>
          <div className="w-full lg:max-w-xl"><SearchBar onSearch={handleSearch} /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <aside className="md:col-span-1"><FilterPanel onFilter={handleFilter} /></aside>
        <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:col-span-3">
          {content}
        </main>
      </div>
    </div>
  );
}
