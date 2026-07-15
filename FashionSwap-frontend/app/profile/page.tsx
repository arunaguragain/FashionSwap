"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Protected from '../../components/common/Protected';
import { useAuth } from '@/context/AuthContext';
import { getMyListings, getOrders } from '@/lib/api';
import { ShoppingBag, Package, TrendingUp, Plus, ArrowRight, ArrowUpRight, Mail, Shield, Lightbulb, Download } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [listingsRes, ordersRes] = await Promise.all([getMyListings(), getOrders()]);
        setMyListings(Array.isArray(listingsRes?.data) ? listingsRes.data : Array.isArray(listingsRes) ? listingsRes : []);
        setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : Array.isArray(ordersRes) ? ordersRes : []);
      } catch (e) {
        setMyListings([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => ({
    listings: myListings.length,
    orders: orders.length,
    active: myListings.filter((item) => (item.status || '').toLowerCase() !== 'sold').length,
  }), [myListings, orders]);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: user?.name || user?.fullName || user?.email || 'Anonymous',
      listings: myListings,
      orders,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fashionswap-profile-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: 'Listings', value: stats.listings, icon: ShoppingBag, bg: 'bg-terracotta/10', iconColor: 'text-terracotta' },
    { label: 'Active listings', value: stats.active, icon: TrendingUp, bg: 'bg-sage/10', iconColor: 'text-sage' },
    { label: 'Orders', value: stats.orders, icon: Package, bg: 'bg-sand', iconColor: 'text-charcoal-soft' },
  ];

  return (
    <Protected>
      <div className="w-full px-6 py-10 md:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
              My account
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || user?.fullName || 'there'}
            </h1>
            <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">
              Manage your listings, track your orders, and export your account data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 border border-border bg-white px-5 py-2.5 rounded-[14px] text-sm font-medium text-charcoal-soft hover:bg-parchment-dark transition-colors"
            >
              Open settings
            </Link>
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors"
            >
              <Download size={15} />
              Export my data
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="listing-card bg-white rounded-[20px] p-5 border border-border/60"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.bg}`}>
                  <stat.icon className={`h-[18px] w-[18px] ${stat.iconColor}`} />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* My Listings */}
          <section className="bg-white rounded-[20px] p-6 border border-border/60">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>My listings</h2>
              <Link
                href="/listing/create"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
              >
                <Plus size={15} />
                New listing
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-24 animate-pulse rounded-[14px] bg-sand-light" />
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="flex flex-col items-center rounded-[14px] bg-parchment-dark/50 border border-border/40 p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] bg-terracotta/10">
                  <ShoppingBag className="h-6 w-6 text-terracotta" />
                </div>
                <p className="font-display font-semibold text-charcoal">No listings yet</p>
                <p className="mt-1 text-sm text-ink">Create your first listing to start selling.</p>
                <Link
                  href="/listing/create"
                  className="mt-5 inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors"
                >
                  <Plus size={15} /> Create listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {myListings.map((listing) => (
                  <Link
                    key={listing.id || listing._id}
                    href={`/listing/${listing.id || listing._id}`}
                    className="group listing-card rounded-[14px] border border-border/60 bg-parchment p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-charcoal group-hover:text-terracotta transition-colors">
                          {listing.title || listing.name || 'Untitled listing'}
                        </p>
                        <p className="mt-1 text-sm text-ink">
                          {listing.price ? `Rs. ${listing.price}` : 'Price not set'}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-ink opacity-0 transition-all group-hover:opacity-100 group-hover:text-terracotta" />
                    </div>
                    <span className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-sage/12 text-sage-dark uppercase tracking-wider">
                      {listing.status || 'active'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Account details */}
          <section className="bg-white rounded-[20px] p-6 border border-border/60">
            <h2 className="font-display text-xl font-bold text-charcoal mb-5" style={{ letterSpacing: '-0.01em' }}>Account details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-terracotta/10">
                  <svg className="h-[18px] w-[18px] text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-ink">Name</p>
                  <p className="text-sm font-semibold text-charcoal">{user?.name || user?.fullName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-sage/10">
                  <Mail className="h-[18px] w-[18px] text-sage" />
                </div>
                <div>
                  <p className="text-xs text-ink">Email</p>
                  <p className="text-sm font-semibold text-charcoal">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-sand">
                  <Shield className="h-[18px] w-[18px] text-charcoal-soft" />
                </div>
                <div>
                  <p className="text-xs text-ink">Role</p>
                  <p className="text-sm font-semibold text-charcoal capitalize">{user?.role || 'member'}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-[14px] bg-sage/8 border border-sage/20 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage" />
              <p className="text-sm text-ink leading-relaxed">
                Keep your profile updated so buyers and sellers can trust your listings.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Protected>
  );
}
