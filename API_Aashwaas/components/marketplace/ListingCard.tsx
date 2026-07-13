"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from '../common/Card';
import { Button } from '../common/Button';
import { cn } from '../common/cn';

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
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative w-full h-56 bg-gray-100 rounded-lg overflow-hidden mb-4">
          <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setSaved(!saved);
              }}
              aria-label={saved ? 'Remove from saved items' : 'Add to saved items'}
              className={cn('p-2 rounded-full transition-colors', saved ? 'bg-red-100 text-red-600' : 'bg-white/80 text-gray-600')}
            >
              {saved ? '♥' : '♡'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {category && <span className="text-xs font-semibold text-primary-700 mb-2 uppercase">{category}</span>}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h3>
          {condition && <p className="text-sm text-gray-500 mb-3">{condition}</p>}
          <p className="text-lg font-bold text-primary-900 mb-3">₹{price}</p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-400" />
              <div>
                <p className="text-xs font-medium text-gray-900">@{seller.name}</p>
                <p className="text-xs text-yellow-500">★ {seller.rating ?? '—'}</p>
              </div>
            </div>

            <div>
              <Button variant="outline">Offer</Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
