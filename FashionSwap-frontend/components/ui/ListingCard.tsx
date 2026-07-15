import React, { useState } from "react";
import { Heart } from "lucide-react";
import Badge from "./Badge";
import { toggleFavorite } from "@/lib/api";

export interface Listing {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  price?: number;
  askingPrice?: number;
  originalPrice?: number;
  condition?: "New" | "Like New" | "Good" | "Fair" | "Poor" | string;
  image?: string;
  images?: string[];
  seller?: string;
  sellerName?: string;
  location?: string;
  category?: string;
  saved?: boolean;
}

const conditionVariant: Record<string, "sage" | "terracotta" | "sand" | "default"> = {
  "New": "sage",
  "Like New": "sage",
  "Good": "sand",
  "Fair": "terracotta",
  "Poor": "terracotta",
};

interface ListingCardProps {
  listing: Listing;
  size?: "sm" | "md";
}

export default function ListingCard({ listing, size = "md" }: ListingCardProps) {
  const [saved, setSaved] = useState(listing.saved ?? false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = listing._id || listing.id;
    if (!id) return;
    
    setSaved(!saved); // Optimistic update
    try {
      const res = await toggleFavorite(id);
      if (res && res.isFavorite !== undefined) {
        setSaved(res.isFavorite);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      setSaved(saved); // Revert on failure
    }
  };

  const displayTitle = listing.title || listing.name || "Untitled";
  const displayImage = listing.image || (listing.images && listing.images[0]) || "";
  const displayPrice = listing.price || listing.askingPrice || 0;
  const displayCondition = listing.condition || "Good";

  return (
    <div className="listing-card bg-white rounded-[20px] overflow-hidden cursor-pointer group">
      <div className="img-zoom relative" style={{ aspectRatio: "3/4" }}>
        <img
          src={displayImage}
          alt={displayTitle}
          className="w-full h-full object-cover bg-sand-light"
        />
        <button
          onClick={handleToggle}
          className={`
            absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200 backdrop-blur-sm
            ${saved ? "bg-terracotta text-white" : "bg-white/80 text-ink hover:bg-white"}
          `}
        >
          <Heart size={15} fill={saved ? "currentColor" : "none"} />
        </button>
        {listing.originalPrice && (
          <div className="absolute top-3 left-3">
            <Badge variant="terracotta">
              -{Math.round((1 - displayPrice / listing.originalPrice) * 100)}%
            </Badge>
          </div>
        )}
      </div>
      <div className={`p-3.5 ${size === "sm" ? "p-3" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className={`font-medium text-charcoal leading-snug line-clamp-2 ${size === "sm" ? "text-sm" : "text-[15px]"}`}>
            {displayTitle}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant={conditionVariant[displayCondition] || "default"}>
            {displayCondition}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-display font-bold text-charcoal ${size === "sm" ? "text-base" : "text-lg"}`}>
              Rs. {displayPrice.toLocaleString()}
            </span>
            {listing.originalPrice && (
              <span className="text-xs text-ink line-through">
                Rs. {listing.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-ink mt-1 truncate">{listing.location || "Online"}</p>
      </div>
    </div>
  );
}
