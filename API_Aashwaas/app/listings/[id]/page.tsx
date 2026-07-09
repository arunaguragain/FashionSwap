"use client";

import React, { useEffect, useState } from 'react';
import ImageGallery from '../../../components/marketplace/ImageGallery';
import Button from '../../../components/common/Button';
import { createOrder, getListing } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';

export default function ListingDetail({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getListing(params.id);
        const payload = (res as any)?.data ?? res ?? null;
        setListing(payload);
      } catch (e: any) {
        setError(e.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleOffer = async () => {
    if (!listing) return;
    setSubmitting(true);
    try {
      await createOrder({
        listingId: listing._id || listing.id,
        offerPrice: listing.askingPrice ?? listing.price ?? 0,
        offerMessage: `Interested in ${listing.title}`,
        deliveryMethod: 'cash_on_delivery',
      });
      pushToast({ title: 'Offer sent', description: 'The seller can now review your offer.', tone: 'success' });
    } catch (e: any) {
      pushToast({ title: 'Offer failed', description: e.message || 'Please try again.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!listing) return <div className="p-6">No listing found</div>;

  const images = Array.isArray(listing.images) && listing.images.length ? listing.images : ['/images/placeholder.png'];
  const price = listing.askingPrice ?? listing.price ?? 0;
  const sellerName = listing.sellerName || listing.seller?.name || 'Seller';
  const location = listing.location || listing.pickupLocation || 'Location shared after offer';

  return (
    <div className="mx-auto max-w-250 p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <ImageGallery images={images} />
        <div>
          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {listing.category || 'Fashion'}
          </div>
          <h1 className="mb-2 text-2xl font-semibold">{listing.title}</h1>
          <p className="mb-4 text-gray-700">{listing.description || 'A great fashion find ready for a new home.'}</p>
          <p className="mb-4 text-2xl font-bold text-slate-900">₹{price}</p>
          <div className="mb-4 space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-slate-900">Condition:</span> {listing.condition || 'Good'}</p>
            <p><span className="font-medium text-slate-900">Seller:</span> {sellerName}</p>
            <p><span className="font-medium text-slate-900">Location:</span> {location}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleOffer} disabled={submitting}>{submitting ? 'Sending...' : 'Make Offer'}</Button>
            <Button variant="secondary">Contact seller</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
