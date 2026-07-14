"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, Share2, MapPin, Star, ChevronLeft, ChevronRight, Shield, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { LISTINGS } from "@/data/listings";
import ListingCard from "@/components/ui/ListingCard";

const IMAGES = [
  "https://images.unsplash.com/photo-1594938298603-e5ad2b254c6a?w=800&h=1067&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1583391099995-ce9f5bb01e64?w=800&h=1067&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1067&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1067&fit=crop&auto=format",
];

export default function ListingDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const listing = LISTINGS.find((l) => l.id === id) || LISTINGS[0];
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  const related = LISTINGS.filter((l) => l.id !== listing.id).slice(0, 4);

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
              src={IMAGES[imgIdx]}
              alt={listing.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <button
              onClick={() => setSaved(!saved)}
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
            {imgIdx < IMAGES.length - 1 && (
              <button
                onClick={() => setImgIdx(imgIdx + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2.5 mt-3">
            {IMAGES.map((img, i) => (
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
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start gap-3 mb-2">
            <Badge variant="terracotta" className="capitalize">{listing.category}</Badge>
            <Badge variant={listing.condition === "New" || listing.condition === "Like New" ? "sage" : "sand"}>
              {listing.condition}
            </Badge>
          </div>

          <h1
            className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-3 mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {listing.title}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-4xl font-bold text-charcoal" style={{ letterSpacing: "-0.02em" }}>
              Rs. {listing.price.toLocaleString()}
            </span>
            {listing.originalPrice && (
              <span className="text-lg text-ink line-through">Rs. {listing.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Description */}
          <div className="bg-parchment-dark rounded-[16px] p-5 mb-6">
            <h3 className="text-sm font-semibold text-charcoal mb-2">Description</h3>
            <p className="text-[14px] text-ink leading-relaxed">
              Beautiful {listing.title.toLowerCase()} in excellent condition. Worn only twice, no stains or damage.
              Measurements: Bust 36", Waist 30", Length 52". Authentic handmade piece — certificate of authenticity included.
              Perfect for festivals and formal occasions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-white border border-border rounded-[14px] px-4 py-3">
              <p className="text-ink text-xs mb-0.5">Location</p>
              <p className="font-medium text-charcoal flex items-center gap-1.5">
                <MapPin size={13} className="text-terracotta" /> {listing.location}
              </p>
            </div>
            <div className="bg-white border border-border rounded-[14px] px-4 py-3">
              <p className="text-ink text-xs mb-0.5">Listed</p>
              <p className="font-medium text-charcoal">3 days ago</p>
            </div>
          </div>

          {/* Seller card */}
          <Link href={`/profile/${encodeURIComponent(listing.seller)}`} className="block bg-white border border-border rounded-[20px] p-5 mb-6 hover:border-terracotta/30 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-sand shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop"
                  alt={listing.seller}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal text-[15px] group-hover:text-terracotta transition-colors">{listing.seller}</p>
                <div className="flex items-center gap-1 text-xs text-ink mt-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span>4.9</span>
                  <span className="text-ink/50">·</span>
                  <span>48 reviews</span>
                  <span className="text-ink/50">·</span>
                  <span>{listing.location}</span>
                </div>
              </div>
              <Badge variant="sage">Verified</Badge>
            </div>
            <p className="text-xs text-ink mt-3">Typically responds within 2 hours</p>
          </Link>

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
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-charcoal mb-6" style={{ letterSpacing: "-0.02em" }}>
          You might also like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {related.map((l) => (
            <Link key={l.id} href={`/listing/${l.id}`}>
              <ListingCard listing={l} size="sm" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
