"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, Share2, MapPin, Star, ChevronLeft, ChevronRight, Shield, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getListing, getListings, toggleFavorite } from "@/lib/api";
import ListingCard from "@/components/ui/ListingCard";

export default function ListingDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getListing(id)
      .then((res) => {
        const data = res?.data || res;
        setListing(data);
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));

    getListings()
      .then((res) => {
        const all = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setRelated(all.filter((l: any) => (l._id || l.id) !== id).slice(0, 4));
      })
      .catch(() => setRelated([]));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="animate-pulse bg-sand-light rounded-[24px]" style={{ aspectRatio: "3/4" }} />
          <div className="space-y-4">
            <div className="h-8 bg-sand-light rounded w-1/3 animate-pulse" />
            <div className="h-12 bg-sand-light rounded w-2/3 animate-pulse" />
            <div className="h-10 bg-sand-light rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-charcoal mb-2">Listing not found</h1>
        <p className="text-ink text-sm mb-6">This item may have been removed or doesn't exist.</p>
        <Link href="/listings" className="text-terracotta hover:text-terracotta-dark font-medium">← Browse listings</Link>
      </div>
    );
  }

  const displayTitle = listing.title || listing.name || "Untitled";
  const displayPrice = listing.price || listing.askingPrice || 0;
  const displayCondition = listing.condition || "Good";
  const displayCategory = listing.category || "";
  const displayLocation = listing.location || "Online";
  const displaySeller = listing.seller || listing.sellerName || listing.sellerId?.firstName || "Seller";
  const displayDescription = listing.description || `Beautiful ${displayTitle.toLowerCase()} in excellent condition.`;
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : listing.image
      ? [listing.image]
      : ["https://images.unsplash.com/photo-1594938298603-e5ad2b254c6a?w=800&h=1067&fit=crop&auto=format"];

  const handleToggleFavorite = async () => {
    const listingId = listing._id || listing.id;
    setSaved(!saved);
    try {
      const res = await toggleFavorite(listingId);
      if (res?.isFavorite !== undefined) setSaved(res.isFavorite);
    } catch {
      setSaved(saved);
    }
  };

  const createdAt = listing.createdAt
    ? new Date(listing.createdAt)
    : null;
  const daysAgo = createdAt
    ? Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-ink hover:text-charcoal mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Image gallery */}
        <div>
          {/* Main image */}
          <div className="relative bg-sand-light rounded-[24px] overflow-hidden" style={{ aspectRatio: "3/4" }}>
            <img
              src={images[imgIdx]}
              alt={displayTitle}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                saved ? "bg-terracotta text-white" : "bg-white text-ink hover:text-terracotta"
              }`}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
            <button className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-ink hover:text-charcoal transition-colors">
              <Share2 size={16} />
            </button>
            {imgIdx > 0 && (
              <button
                onClick={() => setImgIdx(imgIdx - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {imgIdx < images.length - 1 && (
              <button
                onClick={() => setImgIdx(imgIdx + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`rounded-[12px] overflow-hidden flex-1 transition-all ${
                    i === imgIdx ? "ring-2 ring-terracotta ring-offset-1" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ aspectRatio: "1" }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start gap-3 mb-2">
            {displayCategory && <Badge variant="terracotta" className="capitalize">{displayCategory}</Badge>}
            <Badge variant={displayCondition === "New" || displayCondition === "Like New" ? "sage" : "sand"}>
              {displayCondition}
            </Badge>
          </div>

          <h1
            className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-3 mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {displayTitle}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-4xl font-bold text-charcoal" style={{ letterSpacing: "-0.02em" }}>
              Rs. {displayPrice.toLocaleString()}
            </span>
            {listing.originalPrice && (
              <span className="text-lg text-ink line-through">Rs. {listing.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Description */}
          <div className="bg-parchment-dark rounded-[16px] p-5 mb-6">
            <h3 className="text-sm font-semibold text-charcoal mb-2">Description</h3>
            <p className="text-[14px] text-ink leading-relaxed">
              {displayDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-white border border-border rounded-[14px] px-4 py-3">
              <p className="text-ink text-xs mb-0.5">Location</p>
              <p className="font-medium text-charcoal flex items-center gap-1.5">
                <MapPin size={13} className="text-terracotta" /> {displayLocation}
              </p>
            </div>
            <div className="bg-white border border-border rounded-[14px] px-4 py-3">
              <p className="text-ink text-xs mb-0.5">Listed</p>
              <p className="font-medium text-charcoal">{daysAgo !== null ? `${daysAgo} days ago` : "Recently"}</p>
            </div>
          </div>

          {/* Seller card */}
          <div className="block bg-white border border-border rounded-[20px] p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-sand shrink-0 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#c96' }}>
                {typeof displaySeller === 'string' ? displaySeller[0]?.toUpperCase() : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal text-[15px]">{displaySeller}</p>
                <div className="flex items-center gap-1 text-xs text-ink mt-0.5">
                  <MapPin size={11} className="text-terracotta" />
                  <span>{displayLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mt-auto">
            <Button
              fullWidth
              size="lg"
            >
              Make an Offer
            </Button>
            <button className="flex items-center gap-2 border border-border text-charcoal px-5 py-3.5 rounded-[14px] font-medium hover:bg-parchment-dark transition-colors text-[15px] whitespace-nowrap">
              <MessageCircle size={18} />
              Message
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-ink justify-center">
            <Shield size={12} className="text-sage" />
            Cash on delivery · Meet in person · No platform fees
          </div>
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-charcoal mb-6" style={{ letterSpacing: "-0.02em" }}>
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((l) => (
              <Link key={l._id || l.id} href={`/listing/${l._id || l.id}`}>
                <ListingCard listing={l} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
