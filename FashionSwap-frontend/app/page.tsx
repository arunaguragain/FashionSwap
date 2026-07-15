"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Leaf, RefreshCw, Shield } from "lucide-react";
import ListingCard from "@/components/ui/ListingCard";
import Badge from "@/components/ui/Badge";
import { CATEGORIES } from "@/data/listings";
import { getListings } from "@/lib/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch latest listings from backend
    getListings().then(res => {
      if (res && Array.isArray(res.data)) {
        setListings(res.data.slice(0, 4)); // Show 4 latest
      } else if (Array.isArray(res)) {
        setListings(res.slice(0, 4));
      }
    }).catch(err => console.error("Failed to fetch listings", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/listings?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=900&fit=crop&auto=format"
            alt="Fashion editorial"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent" />
        </div>

        <div className="relative w-full px-6 py-24 md:px-8 md:py-36">
          <div className="max-w-xl">
            <Badge variant="terracotta" className="mb-6">
              <Leaf size={12} />
              Conscious fashion · Nepal
            </Badge>
            <h1
              className="font-display text-5xl md:text-7xl font-bold text-parchment leading-[0.95] mb-6"
              style={{ letterSpacing: "-0.03em" }}
            >
              Pre-loved fashion,
              <br />
              <span className="text-terracotta-light">new stories.</span>
            </h1>
            <p className="text-parchment/70 text-lg mb-10 leading-relaxed max-w-sm">
              Buy and sell second-hand clothes, bags, and shoes directly with people in your city. Cash on delivery, no platform fees.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search listings…"
                  className="w-full pl-11 pr-4 py-3.5 rounded-[14px] bg-white text-charcoal placeholder:text-ink/60 text-[15px] outline-none focus:ring-2 focus:ring-terracotta/30"
                />
              </div>
              <button
                type="submit"
                className="bg-terracotta text-white px-6 py-3.5 rounded-[14px] font-medium hover:bg-terracotta-dark transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Saree", "Kurti", "Sneakers", "Dhaka fabric", "Leather bags"].map((tag) => (
                <Link
                  key={tag}
                  href={`/listings?q=${tag}`}
                  className="text-sm text-parchment/60 border border-parchment/20 px-3 py-1 rounded-full hover:border-parchment/50 hover:text-parchment/90 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip removed — kept layout simpler for current UI */}
      </section>

      {/* Categories */}
      <section className="w-full px-6 py-16 md:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: "-0.02em" }}>
              Shop by category
            </h2>
            <p className="text-ink mt-1.5 text-sm">Traditional meets contemporary</p>
          </div>
          <Link href="/listings" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/listings?cat=${cat.id}`}
              className="group relative overflow-hidden rounded-[20px] bg-sand-light cursor-pointer"
              style={{ aspectRatio: "4/5" }}
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="font-display text-2xl font-bold text-parchment" style={{ letterSpacing: "-0.02em" }}>{cat.label}</div>
                <div className="text-parchment/60 text-sm mt-0.5">{cat.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="w-full px-6 pb-16 md:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: "-0.02em" }}>
              Just listed
            </h2>
            <p className="text-ink mt-1.5 text-sm">Fresh arrivals from sellers near you</p>
          </div>
          <Link href="/listings" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors">
            Browse all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <Link key={listing._id || listing.id} href={`/listing/${listing._id || listing.id}`}>
              <ListingCard listing={listing} />
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-charcoal text-parchment py-16">
        <div className="w-full px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ letterSpacing: "-0.02em" }}>
              Why FashionSwap?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <RefreshCw size={24} className="text-terracotta-light" />,
                title: "Direct exchanges",
                desc: "Connect directly with buyers and sellers. Agree on a price, meet for handoff. Simple.",
              },
              {
                icon: <Shield size={24} className="text-terracotta-light" />,
                title: "Cash on delivery",
                desc: "No payment gateway, no processing fees. Pay when you receive the item in person.",
              },
              {
                icon: <Leaf size={24} className="text-terracotta-light" />,
                title: "Conscious fashion",
                desc: "Every pre-loved piece is one fewer fast-fashion purchase. Good for your wallet, better for the planet.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="mt-0.5 shrink-0 w-10 h-10 rounded-xl bg-parchment/10 flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-parchment" style={{ letterSpacing: "-0.01em" }}>{title}</h3>
                  <p className="text-parchment/60 text-sm mt-1.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-terracotta/8 border-y border-border py-16">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4" style={{ letterSpacing: "-0.02em" }}>
            Have something to sell?
          </h2>
          <p className="text-ink mb-8 leading-relaxed">
            List your pre-loved items in minutes. No seller fees, no commissions — keep everything you earn.
          </p>
          <Link
            href="/listing/create"
            className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-3.5 rounded-[14px] font-medium hover:bg-terracotta-dark transition-colors text-[15px]"
          >
            Start selling today <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}