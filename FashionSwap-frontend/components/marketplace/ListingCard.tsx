"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from '../common/Card';
import { Button } from '../common/Button';
import { cn } from '../common/cn';
import { Heart, Sparkles } from 'lucide-react';

interface ListingCardProps {
  id: string;
  image?: string;
  title: string;
  price: number;
  seller: {
    name: string;
    rating?: number;
  };
  condition?: string;
  category?: string;
}

export default function ListingCard({ id, image = '/images/placeholder.png', title, price, seller, condition, category }: ListingCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <Link href={`/listings/${id}`} className="group">
      <Card className="flex h-full cursor-pointer flex-col overflow-hidden p-0 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(27,28,25,0.08)]">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
          <Image src={image} alt={title} fill className="object-cover transition duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Gently Used
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(!saved);
            }}
            aria-label={saved ? 'Remove from saved items' : 'Add to saved items'}
            className={cn('absolute right-3 top-3 rounded-full border p-2.5 transition', saved ? 'border-primary/15 bg-primary/10 text-primary' : 'border-white/70 bg-white/80 text-on-surface-variant')}
          >
            <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {category && <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">{category}</span>}
          <h3 className="mb-2 line-clamp-2 font-semibold text-on-surface">{title}</h3>
          {condition && <p className="mb-3 text-sm text-on-surface-variant">{condition}</p>}
          <p className="mb-4 text-2xl font-semibold text-on-surface">₹{price}</p>

          <div className="mt-auto flex items-center justify-between border-t border-outline/10 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {seller.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">@{seller.name}</p>
                <p className="text-xs text-on-surface-variant">★ {seller.rating ?? '—'}</p>
              </div>
            </div>
            <Button variant="outline" className="px-3 py-2 text-sm">Offer</Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
