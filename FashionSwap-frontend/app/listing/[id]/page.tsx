"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, Share2, MapPin, Star, ChevronLeft, ChevronRight, Shield, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getListing, getListings, toggleFavorite } from "@/lib/api";
import ListingCard from "@/components/ui/ListingCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

export default function ListingDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Buy Now Modal States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    zipCode: ""
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleBuyNow = async () => {
    const { fullName, phone, street, city, zipCode } = deliveryDetails;
    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      pushToast({
        title: "Missing Information",
        description: "Please fill in all required delivery details (Name, Phone, Street, City).",
        tone: "error"
      });
      return;
    }

    const formattedAddress = `${fullName}\nPhone: ${phone}\n${street}, ${city} ${zipCode}`.trim();

    setIsSubmittingOrder(true);
    try {
      const { createOrder } = await import("@/lib/api");
      const res = await createOrder({
        listingId: listing._id || listing.id,
        price: listing.price || listing.askingPrice,
        deliveryMethod: "cash_on_delivery",
        deliveryAddress: formattedAddress,
      });

      setIsCheckoutModalOpen(false);
      pushToast({
        title: "Success!",
        description: "Order placed successfully!",
        tone: "success"
      });
      router.push("/orders");
    } catch (err: any) {
      pushToast({
        title: "Error",
        description: err.message || "Failed to place order.",
        tone: "error"
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

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
  const isOwner = user && listing && (
    (user._id || user.id) === listing.sellerId || 
    (user._id || user.id) === listing.sellerId?._id || 
    (user._id || user.id) === listing.seller
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-ink hover:text-charcoal mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Col - Images */}
        <div className="space-y-4">
          <div className="w-full bg-sand-light rounded-[24px] overflow-hidden relative group" style={{ aspectRatio: "3/4" }}>
            <img src={images[imgIdx]} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-charcoal shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
            >
              <Heart size={20} className={saved ? "fill-terracotta text-terracotta" : ""} />
            </button>
            
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-charcoal opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white disabled:opacity-0"
                  onClick={() => setImgIdx(prev => prev > 0 ? prev - 1 : prev)}
                  disabled={imgIdx === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-charcoal opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white disabled:opacity-0"
                  onClick={() => setImgIdx(prev => prev < images.length - 1 ? prev + 1 : prev)}
                  disabled={imgIdx === images.length - 1}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
            {isOwner ? (
              <Button
                fullWidth
                size="lg"
                onClick={() => router.push(`/listing/${id}/edit`)}
              >
                Edit Listing
              </Button>
            ) : (
              <Button
                fullWidth
                size="lg"
                onClick={() => setIsCheckoutModalOpen(true)}
              >
                Buy Now
              </Button>
            )}
          </div>

          {!isOwner && (
            <div className="flex items-center gap-2 mt-4 text-xs text-ink justify-center">
              <Shield size={12} className="text-sage" />
              Cash on delivery · Meet in person · No platform fees
            </div>
          )}
        </div>
      </div>

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute right-4 top-4 text-ink hover:text-charcoal transition-colors"
            >
              <Shield size={20} className="hidden" /> {/* just keeping import happy if unused, wait shield is used above. I'll just use X from lucide but it's not imported. Let me use HTML entity */}
              ✕
            </button>
            <h2 className="font-display text-2xl font-bold text-charcoal mb-4">Checkout</h2>
            <div className="mb-4">
              <p className="text-sm font-semibold text-charcoal">Item: {displayTitle}</p>
              <p className="text-lg font-bold text-terracotta">Rs. {displayPrice.toLocaleString()}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Full Name</label>
                <input
                  type="text"
                  value={deliveryDetails.fullName}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ram Bahadur"
                  className="w-full rounded-[14px] border border-border px-3 py-2 text-sm text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={deliveryDetails.phone}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full rounded-[14px] border border-border px-3 py-2 text-sm text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Street Address</label>
                <input
                  type="text"
                  value={deliveryDetails.street}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Thamel, Jyatha"
                  className="w-full rounded-[14px] border border-border px-3 py-2 text-sm text-charcoal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">City</label>
                  <input
                    type="text"
                    value={deliveryDetails.city}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Kathmandu"
                    className="w-full rounded-[14px] border border-border px-3 py-2 text-sm text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">Zip Code <span className="text-ink font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={deliveryDetails.zipCode}
                    onChange={(e) => setDeliveryDetails(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="44600"
                    className="w-full rounded-[14px] border border-border px-3 py-2 text-sm text-charcoal"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button fullWidth onClick={handleBuyNow} disabled={isSubmittingOrder}>
                {isSubmittingOrder ? "Placing Order..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
