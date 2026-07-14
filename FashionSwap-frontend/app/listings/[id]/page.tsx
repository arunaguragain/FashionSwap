"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageGallery from '../../../components/marketplace/ImageGallery';
import Button from '../../../components/common/Button';
import Badge from '@/components/ui/Badge';
import { getListing } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { MapPin, ShieldCheck, Sparkles, ChevronLeft, MessageCircle } from 'lucide-react';

export default function ListingDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleOffer = () => {
    if (!listing) return;
    router.push(`/make-offer?listingId=${params.id}`);
  };

  const listingDetails = useMemo(() => {
    if (!listing) return null;
    const images = Array.isArray(listing.images) && listing.images.length ? listing.images : ['/images/placeholder.png'];
    const price = listing.askingPrice ?? listing.price ?? 0;
    const sellerName = listing.sellerName || listing.seller?.name || 'Seller';
    const location = listing.location || listing.pickupLocation || 'Location shared after offer';
    const conditionVariant = (listing.condition === 'New' || listing.condition === 'Like New' ? 'sage' : 'sand') as 'sage' | 'sand';

    return { images, price, sellerName, location, conditionVariant };
  }, [listing]);

  if (loading) return <div className="px-4 py-8 text-sm text-on-surface-variant sm:px-6 lg:px-8">Loading listing…</div>;
  if (error) return <div className="px-4 py-8 text-sm text-error sm:px-6 lg:px-8">{error}</div>;
  if (!listing || !listingDetails) return <div className="px-4 py-8 text-sm text-on-surface-variant sm:px-6 lg:px-8">No listing found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="grid gap-8 rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(27,28,25,0.06)] lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div>
          <ImageGallery images={listingDetails.images} />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-4 flex flex-wrap gap-3">
              <Badge variant="terracotta" className="capitalize">{listing.category || 'Fashion'}</Badge>
              <Badge variant={listingDetails.conditionVariant}>{listing.condition || 'Good'}</Badge>
            </div>
            <h1 className="font-display text-3xl font-bold text-on-surface sm:text-4xl leading-tight">{listing.title}</h1>
            <p className="mt-4 text-base leading-8 text-on-surface-variant">{listing.description || 'A beautifully curated piece ready for its next chapter.'}</p>

            <div className="mt-6 rounded-[1.5rem] border border-outline/15 bg-surface-container-low p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-on-surface-variant">Price</p>
                  <p className="mt-2 text-4xl font-semibold text-on-surface">₹{listingDetails.price.toLocaleString()}</p>
                </div>
                <div className="space-y-3 text-sm text-on-surface-variant">
                  <div><span className="font-semibold text-on-surface">Condition:</span> {listing.condition || 'Good'}</div>
                  <div><span className="font-semibold text-on-surface">Seller:</span> {listingDetails.sellerName}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span>{listingDetails.location}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={handleOffer} className="w-full py-4 text-base">
                Make an offer
              </Button>
              <button className="flex items-center justify-center gap-2 rounded-full border border-outline/15 bg-white px-4 py-4 text-base font-semibold text-on-surface transition hover:border-primary/40 hover:text-primary">
                <MessageCircle className="h-4 w-4" /> Message seller
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[1rem] border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              <ShieldCheck className="h-4 w-4 text-primary" /> Secure conversations and offer tracking remain enabled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
