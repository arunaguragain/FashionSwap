"use client";

import React, { useEffect, useState } from 'react';
import ImageGallery from '../../../components/marketplace/ImageGallery';
import Button from '../../../components/common/Button';
import { createOrder, getListing } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';

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

  if (loading) return <div className="px-4 py-8 text-sm text-on-surface-variant sm:px-6 lg:px-8">Loading listing…</div>;
  if (error) return <div className="px-4 py-8 text-sm text-error sm:px-6 lg:px-8">{error}</div>;
  if (!listing) return <div className="px-4 py-8 text-sm text-on-surface-variant sm:px-6 lg:px-8">No listing found</div>;

  const images = Array.isArray(listing.images) && listing.images.length ? listing.images : ['/images/placeholder.png'];
  const price = listing.askingPrice ?? listing.price ?? 0;
  const sellerName = listing.sellerName || listing.seller?.name || 'Seller';
  const location = listing.location || listing.pickupLocation || 'Location shared after offer';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(27,28,25,0.06)] lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <ImageGallery images={images} />
        <div className="flex flex-col justify-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {listing.category || 'Fashion'}
          </div>
          <h1 className="font-headline text-3xl text-on-surface sm:text-4xl">{listing.title}</h1>
          <p className="mt-4 text-base leading-8 text-on-surface-variant">{listing.description || 'A great fashion find ready for a new home.'}</p>
          <div className="mt-6 rounded-[1.5rem] border border-outline/15 bg-surface-container-low p-5">
            <p className="text-4xl font-semibold text-on-surface">₹{price}</p>
            <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
              <p><span className="font-semibold text-on-surface">Condition:</span> {listing.condition || 'Good'}</p>
              <p><span className="font-semibold text-on-surface">Seller:</span> {sellerName}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span>{location}</span></p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleOffer} disabled={submitting}>{submitting ? 'Sending...' : 'Make Offer'}</Button>
            <Button variant="secondary">Contact seller</Button>
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-[1rem] border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure conversations and offer tracking stay enabled on this listing.
          </div>
        </div>
      </div>
    </div>
  );
}
