"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Protected from '../../components/common/Protected';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { getFavorites } from '@/lib/api';
import ListingCard from '@/components/ui/ListingCard';

export default function SavedPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const favoritesInitializedRef = useRef(false);

  useEffect(() => {
    // Guard against Strict Mode double invocation
    if (favoritesInitializedRef.current) return;
    favoritesInitializedRef.current = true;

    getFavorites()
      .then(res => {
        setFavorites(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error('Failed to load favorites', err);
        setFavorites([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected>
      <div className="w-full px-6 py-10 md:px-8">
        <div className="mb-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
            Favourites
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
            Saved items
          </h1>
          <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">
            Items you've hearted will appear here so you can easily find them later.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-80 animate-pulse rounded-[20px] bg-sand-light" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map((listing) => (
              <Link key={listing.id || listing._id} href={`/listing/${listing.id || listing._id}`}>
                <ListingCard listing={{ ...listing, saved: true }} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-[20px] border border-border/60 p-16 text-center">
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-terracotta/10">
                <Heart className="h-9 w-9 text-terracotta" />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-sage/12">
                <Sparkles className="h-4 w-4 text-sage" />
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>
              No saved items yet
            </h2>
            <p className="mt-3 max-w-sm text-sm text-ink leading-relaxed">
              When you heart an item while browsing, it'll show up here so you can compare and come back to it later.
            </p>

            <Link
              href="/listings"
              className="mt-8 inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3.5 rounded-[14px] text-[15px] font-medium hover:bg-terracotta-dark transition-colors"
            >
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-12 grid w-full max-w-lg grid-cols-3 gap-3">
              {["Clothes", "Bags", "Shoes"].map((cat) => (
                <Link
                  key={cat}
                  href={`/listings?cat=${cat.toLowerCase()}`}
                  className="listing-card group rounded-[14px] border border-border bg-parchment p-5 text-center"
                >
                  <p className="font-display font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                    {cat}
                  </p>
                  <p className="mt-1 text-xs text-ink">
                    Explore →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
