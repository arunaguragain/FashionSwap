"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, MapPin } from 'lucide-react';
import Button from '@/components/common/Button';
import Badge from '@/components/ui/Badge';
import Protected from '@/components/common/Protected';
import { createOrder, getListing } from '@/lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';

const TIME_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];

interface MakeOfferClientProps {
  listingId: string;
}

export default function MakeOfferClient({ listingId }: MakeOfferClientProps) {
  const router = useRouter();
  const { pushToast } = useToast();

  const [step, setStep] = useState<'offer' | 'meetup' | 'confirm' | 'done'>('offer');
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Dharahara, Kathmandu');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;

    const loadListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getListing(listingId);
        const payload = (res as any)?.data ?? res ?? null;
        setListing(payload);
        const price = payload?.askingPrice ?? payload?.price ?? '';
        setOfferPrice(price ? String(price) : '');
      } catch (err: any) {
        setError(err?.message || 'Unable to load listing.');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  const listingPrice = useMemo(() => {
    if (!listing) return 0;
    return listing.askingPrice ?? listing.price ?? 0;
  }, [listing]);

  const previewTitle = listing?.title || 'Listing';
  const previewSeller = listing?.sellerName || listing?.seller?.name || 'Seller';
  const previewLocation = listing?.location || 'Kathmandu';
  const previewCondition = listing?.condition || 'Good';

  const handleSendOffer = async () => {
    if (!listing) return;
    setSubmitting(true);
    try {
      await createOrder({
        listingId: listing._id || listing.id || listingId,
        offerPrice: Number(offerPrice) || listingPrice,
        offerMessage: message,
        meetupLocation: location,
        meetupDate: date,
        meetupTime: time,
        paymentMethod: 'cash_on_delivery',
      });
      pushToast({ title: 'Offer sent', description: 'Your offer has been submitted.', tone: 'success' });
      setStep('done');
    } catch (err: any) {
      pushToast({ title: 'Offer failed', description: err?.message || 'Please try again.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOfferPrice = Number(offerPrice) || listingPrice;

  if (loading) {
    return <div className="px-4 py-10 text-sm text-on-surface-variant">Loading offer details…</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        <div className="rounded-[1.5rem] border border-error/20 bg-error/10 p-6 text-sm text-error">{error}</div>
      </div>
    );
  }

  if (!listing) {
    return <div className="px-4 py-10 text-sm text-on-surface-variant">Select a listing before sending an offer.</div>;
  }

  return (
    <Protected>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        {step === 'done' ? (
          <div className="rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-8 text-center shadow-[0_24px_80px_rgba(27,28,25,0.06)]">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-sage/15 text-sage">
              <Check className="h-10 w-10" />
            </div>
            <h1 className="font-display text-3xl font-bold text-on-surface">Offer sent!</h1>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Your offer of <strong>Rs. {selectedOfferPrice.toLocaleString()}</strong> has been sent.
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">You’ll be notified when the seller responds.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button onClick={() => router.push('/orders')} className="w-full py-4">
                View orders
              </Button>
              <Button variant="outline" onClick={() => router.push('/listings')} className="w-full py-4">
                Continue browsing
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              {['offer', 'meetup', 'confirm'].map((stage, index) => {
                const currentIndex = ['offer', 'meetup', 'confirm'].indexOf(step);
                const stageIndex = ['offer', 'meetup', 'confirm'].indexOf(stage as 'offer' | 'meetup' | 'confirm');
                return (
                  <React.Fragment key={stage}>
                    <div className="flex items-center gap-2">
                      <div className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ${
                        stageIndex < currentIndex ? 'bg-sage text-white' : stageIndex === currentIndex ? 'bg-primary text-white' : 'bg-outline text-on-surface-variant'
                      }`}>
                        {stageIndex < currentIndex ? <Check size={12} /> : index + 1}
                      </div>
                      <span className={stageIndex === currentIndex ? 'text-on-surface' : 'text-on-surface-variant'}>{stage === 'offer' ? 'Your offer' : stage === 'meetup' ? 'Meetup' : 'Confirm'}</span>
                    </div>
                    {index < 2 && <div className={`h-px flex-1 ${stageIndex < currentIndex ? 'bg-sage' : 'bg-outline'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-6 shadow-[0_14px_40px_rgba(27,28,25,0.06)]">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-[1.25rem] bg-surface-container p-3">
                  <img src={listing.images?.[0] || '/images/placeholder.png'} alt={previewTitle} className="h-full w-full rounded-[1rem] object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-on-surface">{previewTitle}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{previewSeller} · {previewLocation}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="sage">{previewCondition}</Badge>
                    <span className="text-sm font-semibold text-on-surface">Rs. {listingPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {step === 'offer' && (
              <div className="rounded-[2rem] border border-outline/15 bg-white p-6">
                <h2 className="text-xl font-semibold text-on-surface">Your offer</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Start with a price and optional message for the seller.</p>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-on-surface">Offer price (Rs.)</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">Rs.</span>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-4 pl-12 text-2xl font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-on-surface">Message to seller (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi, I'm interested in this item…"
                    rows={4}
                    className="w-full rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[0.9, 0.85, 0.8].map((ratio) => {
                    const suggested = Math.round(listingPrice * ratio);
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setOfferPrice(String(suggested))}
                        className={`rounded-[1rem] border p-3 text-left text-sm transition ${
                          Number(offerPrice) === suggested ? 'border-primary bg-primary/10 text-primary' : 'border-outline/30 bg-white text-on-surface hover:border-primary/40'
                        }`}
                      >
                        Rs. {suggested.toLocaleString()}
                        <p className="mt-1 text-xs text-on-surface-variant">{Math.round((1 - ratio) * 100)}% off</p>
                      </button>
                    );
                  })}
                </div>

                <Button className="mt-6 py-4 w-full" onClick={() => setStep('meetup')}>
                  Continue <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {step === 'meetup' && (
              <div className="rounded-[2rem] border border-outline/15 bg-white p-6">
                <h2 className="text-xl font-semibold text-on-surface">Suggest a meetup</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Choose a convenient location, date, and time.</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-on-surface">Meetup location</label>
                    <div className="flex items-center gap-2 rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border-0 bg-transparent text-sm text-on-surface outline-none"
                        placeholder="e.g. Dharahara, Kathmandu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-on-surface">Preferred date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-on-surface">Preferred time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          className={`rounded-[1rem] border px-3 py-3 text-sm transition ${
                            time === slot ? 'border-primary bg-primary/10 text-primary' : 'border-outline/30 bg-white text-on-surface hover:border-primary/40'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep('offer')}>Back</Button>
                  <Button className="w-full" onClick={() => setStep('confirm')}>Review offer <ChevronRight size={16} /></Button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="rounded-[2rem] border border-outline/15 bg-white p-6">
                <h2 className="text-xl font-semibold text-on-surface">Review offer</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Confirm the details before sending your offer.</p>

                <div className="mt-6 space-y-3 rounded-[1.5rem] border border-outline/30 bg-surface-container-lowest p-4">
                  {[
                    ['Offer price', `Rs. ${selectedOfferPrice.toLocaleString()}`],
                    ['Listed price', `Rs. ${listingPrice.toLocaleString()}`],
                    ['Meetup', location],
                    ['Date & time', date && time ? `${date} · ${time}` : 'Flexible'],
                    ['Payment', 'Cash on delivery'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-outline/30 py-3 last:border-b-0">
                      <span className="text-sm text-on-surface-variant">{label}</span>
                      <span className="text-sm font-medium text-on-surface">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 text-sm text-on-surface-variant">
                  <p className="font-medium text-on-surface">Note</p>
                  <p className="mt-2">
                    By sending this offer, you agree to meet the seller in person and complete payment with cash on delivery.
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep('meetup')}>Back</Button>
                  <Button className="w-full py-4" onClick={handleSendOffer} disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send offer'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Protected>
  );
}
