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
      return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
    }

    if (items.length === 0) {
      return <div className="rounded-lg border border-dashed border-gray-300 p-6 text-gray-600">No listings match your current search.</div>;
    }

    return items.map((l) => {
      const id = l._id || l.id;
      const image = l.images?.[0] || l.image || '/images/placeholder.png';
      const sellerName = l.seller?.name || l.sellerName || 'seller';
      const price = l.askingPrice ?? l.price ?? 0;
      return (
        <ListingCard
          key={id}
          id={String(id)}
          image={image}
          title={l.title}
          price={price}
          seller={{ name: sellerName, rating: l.seller?.rating }}
          condition={l.condition}
          category={l.category}
        />
      );
    });
  }, [error, items, loading]);

  return (
    <div className="mx-auto max-w-300 p-6">
      <div className="mb-6"><SearchBar onSearch={handleSearch} /></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <aside className="md:col-span-1"><FilterPanel onFilter={handleFilter} /></aside>
        <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:col-span-3">
          {content}
        </main>
      </div>
    </div>
  );
}
