"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Protected from '../../components/common/Protected';
import { getMyListings, deleteListing, markListingAsSold } from '@/lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { ShoppingBag, ArrowUpRight, Package, ArrowRight, X } from 'lucide-react';

export default function MyListingsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; listingId: string | null }>({
    isOpen: false,
    listingId: null
  });
  
  const dataInitializedRef = useRef(false);

  useEffect(() => {
    if (dataInitializedRef.current) return;
    dataInitializedRef.current = true;

    (async () => {
      try {
        const listingsRes = await getMyListings();
        setMyListings(Array.isArray(listingsRes?.data) ? listingsRes.data : Array.isArray(listingsRes) ? listingsRes : []);
      } catch (e) {
        setMyListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const confirmDelete = (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    setDeleteConfirmation({ isOpen: true, listingId });
  };

  const executeDelete = async () => {
    if (!deleteConfirmation.listingId) return;
    const listingId = deleteConfirmation.listingId;
    setDeleteConfirmation({ isOpen: false, listingId: null });
    
    try {
      await deleteListing(listingId);
      pushToast({ title: 'Listing deleted', tone: 'success' });
      setMyListings((prev) => prev.filter(l => (l.id || l._id) !== listingId));
    } catch (e: any) {
      pushToast({ title: 'Delete failed', description: e?.message || 'Unable to delete listing.', tone: 'error' });
    }
  };

  const handleMarkAsSold = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    try {
      await markListingAsSold(listingId);
      pushToast({ title: 'Marked as sold', tone: 'success' });
      setMyListings((prev) => 
        prev.map(l => (l.id || l._id) === listingId ? { ...l, status: 'sold' } : l)
      );
    } catch (e: any) {
      pushToast({ title: 'Update failed', description: e?.message || 'Unable to mark as sold.', tone: 'error' });
    }
  };

  return (
    <Protected>
      <div className="w-full px-6 py-10 md:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
              Listings
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>My Listings</h1>
            <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">Manage the items you're selling.</p>
          </div>
          
          <Link
            href="/listing/create"
            className="inline-flex items-center justify-center gap-2 bg-terracotta text-white px-6 py-3.5 rounded-[14px] text-[15px] font-medium hover:bg-terracotta-dark transition-colors"
          >
            Create New Listing
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-sand-light rounded-[16px] animate-pulse border border-border/60"></div>
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-[20px] border border-border/60 p-16 text-center">
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-terracotta/10">
                <Package className="h-9 w-9 text-terracotta" />
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>No listings yet</h2>
            <p className="mt-3 max-w-sm text-sm text-ink leading-relaxed">
              You haven't posted any items for sale. Declutter your closet and make some cash!
            </p>

            <Link
              href="/listing/create"
              className="mt-8 inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3.5 rounded-[14px] text-[15px] font-medium hover:bg-terracotta-dark transition-colors"
            >
              Post your first item
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myListings.map((listing) => {
              const id = listing.id || listing._id;
              const displayImage = listing.image || (listing.images && listing.images[0]) || "";
              const displayPrice = listing.askingPrice || listing.price || 0;
              const status = (listing.status || 'active').toLowerCase();
              
              return (
                <Link
                  key={id}
                  href={`/listing/${id}`}
                  className="group flex flex-col sm:flex-row gap-4 listing-card rounded-[16px] border border-border/60 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  {/* Image Thumbnail */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[12px] bg-sand-light relative">
                    {displayImage ? (
                      <img src={displayImage} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink/30">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                    {status === 'sold' && (
                      <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white bg-charcoal px-2 py-0.5 rounded-sm uppercase tracking-wider">Sold</span>
                      </div>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-charcoal group-hover:text-terracotta transition-colors line-clamp-1">
                          {listing.title || listing.name || 'Untitled listing'}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-ink opacity-0 transition-all group-hover:opacity-100 group-hover:text-terracotta" />
                      </div>
                      
                      <p className="mt-1 font-display font-bold text-charcoal">
                        {displayPrice ? `Rs. ${displayPrice.toLocaleString()}` : 'Price not set'}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          status === 'sold' ? 'bg-ink/10 text-ink' : 'bg-sage/15 text-sage-dark'
                        }`}>
                          {status}
                        </span>
                        {listing.category && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-parchment-dark text-ink">
                            {listing.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/50">
                      {status !== 'sold' && (
                        <button
                          onClick={(e) => handleMarkAsSold(e, id)}
                          className="text-xs font-medium text-sage hover:text-sage-dark px-2 py-1 rounded-md hover:bg-sage/10 transition-colors"
                        >
                          Mark as Sold
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); router.push(`/listing/${id}/edit`); }}
                        className="text-xs font-medium text-charcoal-soft hover:text-charcoal px-2 py-1 rounded-md hover:bg-parchment-dark transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => confirmDelete(e, id)}
                        className="text-xs font-medium text-terracotta hover:text-red-700 ml-auto px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setDeleteConfirmation({ isOpen: false, listingId: null })}
                className="absolute top-4 right-4 text-ink hover:text-charcoal transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <X className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">Delete Listing</h3>
                <p className="text-sm text-ink leading-relaxed">
                  Are you sure you want to delete this listing? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, listingId: null })}
                  className="flex-1 px-4 py-2.5 rounded-[12px] bg-white border border-border text-charcoal font-medium hover:bg-parchment-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2.5 rounded-[12px] bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
