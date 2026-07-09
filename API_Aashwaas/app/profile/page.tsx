"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../components/common/Button';
import Protected from '../../components/common/Protected';
import { useAuth } from '@/context/AuthContext';
import { getMyListings, getOrders } from '@/lib/api';

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

  return (
    <Protected>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">My account</p>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {user?.name || user?.fullName || 'there'}</h1>
            <p className="text-sm text-slate-500">Manage your listings, track your orders, and export your account data.</p>
          </div>
          <Button onClick={exportData}>Export my data</Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Listings</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.listings}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Active listings</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Orders</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.orders}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My listings</h2>
              <a href="/listing/create" className="text-sm font-medium text-blue-600 hover:text-blue-700">+ New listing</a>
            </div>
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : myListings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">You have not created any listings yet.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {myListings.map((listing) => (
                  <div key={listing.id || listing._id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-900">{listing.title || listing.name || 'Untitled listing'}</p>
                    <p className="mt-1 text-sm text-slate-500">{listing.price ? `₹${listing.price}` : 'Price not set'}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{listing.status || 'active'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div><span className="font-medium text-slate-900">Name:</span> {user?.name || user?.fullName || '—'}</div>
              <div><span className="font-medium text-slate-900">Email:</span> {user?.email || '—'}</div>
              <div><span className="font-medium text-slate-900">Role:</span> {user?.role || 'member'}</div>
            </div>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Tip: keep your profile updated so buyers and sellers can trust your listings.
            </div>
          </section>
        </div>
      </div>
    </Protected>
  );
}
