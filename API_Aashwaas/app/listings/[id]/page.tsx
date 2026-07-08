"use client";

import React from 'react';
import ImageGallery from '../../../components/marketplace/ImageGallery';
import Button from '../../../components/common/Button';
import { useEffect, useState } from 'react';
import { getListing } from '../../../lib/api';

export default function ListingDetail({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getListing(params.id);
        setListing(res?.data ?? res ?? null);
      } catch (e: any) {
        setError(e.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!listing) return <div className="p-6">No listing found</div>;

  const images = listing.images ?? ['/images/placeholder.png'];

  return (
    <div className="max-w-[1000px] mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        <ImageGallery images={images} />
        <div>
          <h1 className="text-2xl font-semibold mb-2">{listing.title}</h1>
          <p className="text-gray-700 mb-4">{listing.description}</p>
          <p className="text-lg font-bold mb-4">Price: ₹{listing.price}</p>
          <div className="flex gap-3">
            <Button>Add to cart</Button>
            <Button>Contact seller</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
