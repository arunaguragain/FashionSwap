"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ListingCard from "@/components/ui/ListingCard";
import Badge from "@/components/ui/Badge";
import { getListings } from "@/lib/api";

const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const CATEGORIES = ["clothes", "bags", "shoes", "accessories", "jewellery"];

function BrowseContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams?.get("cat") ? [searchParams.get("cat")!] : []
  );
  const [selectedConds, setSelectedConds] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [allListings, setAllListings] = useState<any[]>([]);

  useEffect(() => {
    getListings().then(res => {
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllListings(data);
    }).catch(() => setAllListings([]));
  }, []);

  useEffect(() => {
    setQuery(searchParams?.get("q") || "");
    setSelectedCats(searchParams?.get("cat") ? [searchParams.get("cat")!] : []);
  }, [searchParams]);

  const toggleFilter = <T extends string>(arr: T[], val: T, setter: (a: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let list = [...allListings];
    const getTitle = (l: any) => l.title || l.name || '';
    const getPrice = (l: any) => l.price || l.askingPrice || 0;
    const getCat = (l: any) => l.category || '';
    const getCond = (l: any) => l.condition || 'Good';
    if (query) list = list.filter((l) => getTitle(l).toLowerCase().includes(query.toLowerCase()));
    if (selectedCats.length) list = list.filter((l) => selectedCats.includes(getCat(l)));
    if (selectedConds.length) list = list.filter((l) => selectedConds.includes(getCond(l)));
    if (priceMin) list = list.filter((l) => getPrice(l) >= parseInt(priceMin));
    if (priceMax) list = list.filter((l) => getPrice(l) <= parseInt(priceMax));
    if (sort === "price-asc") list.sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === "price-desc") list.sort((a, b) => getPrice(b) - getPrice(a));
    return list;
  }, [query, selectedCats, selectedConds, priceMin, priceMax, sort, allListings]);

  const activeFilterCount = selectedCats.length + selectedConds.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="text-sm font-semibold text-charcoal mb-3">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleFilter(selectedCats, cat, setSelectedCats)}
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer ${
                  selectedCats.includes(cat)
                    ? "bg-terracotta border-terracotta"
                    : "border-border group-hover:border-terracotta/50"
                }`}
              >
                {selectedCats.includes(cat) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-charcoal capitalize">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="text-sm font-semibold text-charcoal mb-3">Condition</h4>
        <div className="space-y-2">
          {CONDITIONS.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleFilter(selectedConds, cond, setSelectedConds)}
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer ${
                  selectedConds.includes(cond)
                    ? "bg-terracotta border-terracotta"
                    : "border-border group-hover:border-terracotta/50"
                }`}
              >
                {selectedConds.includes(cond) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-charcoal">{cond}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-sm font-semibold text-charcoal mb-3">Price (Rs.)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-[10px] border border-border bg-white text-charcoal outline-none focus:border-terracotta"
          />
          <span className="flex items-center text-ink text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-[10px] border border-border bg-white text-charcoal outline-none focus:border-terracotta"
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={() => { setSelectedCats([]); setSelectedConds([]); setPriceMin(""); setPriceMax(""); }}
          className="w-full text-sm text-terracotta border border-terracotta/30 rounded-[10px] py-2 hover:bg-terracotta/5 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8">
      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for anything…"
            className="w-full pl-11 pr-4 py-3 rounded-[14px] bg-white border border-border text-charcoal text-[15px] outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
          />
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-[14px] border text-sm font-medium transition-colors ${
            filterOpen || activeFilterCount > 0
              ? "bg-terracotta text-white border-terracotta"
              : "bg-white border-border text-charcoal hover:bg-parchment-dark"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 bg-white text-terracotta text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="hidden sm:block px-4 py-3 rounded-[14px] bg-white border border-border text-charcoal text-sm outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCats.map(c => (
            <Badge key={c} variant="terracotta">
              {c}
              <button onClick={() => toggleFilter(selectedCats, c, setSelectedCats)}><X size={11} /></button>
            </Badge>
          ))}
          {selectedConds.map(c => (
            <Badge key={c} variant="sand">
              {c}
              <button onClick={() => toggleFilter(selectedConds, c, setSelectedConds)}><X size={11} /></button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-[20px] border border-border p-5">
            <h3 className="font-semibold text-charcoal mb-5 text-[15px]">Filter</h3>
            <FilterPanel />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {/* Mobile filter drawer */}
          {filterOpen && (
            <div className="lg:hidden bg-white rounded-[20px] border border-border p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal">Filter</h3>
                <button onClick={() => setFilterOpen(false)} className="text-ink hover:text-charcoal">
                  <X size={18} />
                </button>
              </div>
              <FilterPanel />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink">
              <span className="font-medium text-charcoal">{filtered.length}</span> listings
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl font-semibold text-charcoal mb-2" style={{ letterSpacing: "-0.01em" }}>No results found</p>
              <p className="text-ink text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((listing) => (
                <Link key={listing._id || listing.id} href={`/listing/${listing._id || listing.id}`}>
                  <ListingCard listing={listing} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
