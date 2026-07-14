"use client";
import React, { useEffect, useState } from "react";
import { Users, Package, TrendingUp } from "lucide-react";
import { getUsers } from "@/lib/api/admin/user";
import { getListings, getOrders } from "@/lib/api";

export default function AdminDashboard() {
  const [apiError, setApiError] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    orders: 0,
    growth: 0,
    recent: [] as any[],
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, listingsRes, ordersRes] = await Promise.all([getUsers(), getListings(), getOrders()]);
        const usersPayload = usersRes as any;
        const listingsPayload = listingsRes as any;
        const ordersPayload = ordersRes as any;
        const usersList = Array.isArray(usersPayload) ? usersPayload : Array.isArray(usersPayload?.data) ? usersPayload.data : [];
        const listings = Array.isArray(listingsPayload?.data) ? listingsPayload.data : Array.isArray(listingsPayload) ? listingsPayload : [];
        const orders = Array.isArray(ordersPayload?.data) ? ordersPayload.data : Array.isArray(ordersPayload) ? ordersPayload : [];

        setStats({
          users: usersList.length,
          listings: listings.length,
          orders: orders.length,
          growth: listings.length > 0 ? Math.min(100, Math.round((orders.length / Math.max(1, listings.length)) * 100)) : 0,
          recent: listings.slice(0, 6).map((listing: any) => ({
            title: listing.title || "Untitled listing",
            price: listing.askingPrice ?? listing.price ?? 0,
            category: listing.category || "General",
            status: listing.status || "available",
          })),
        });
        setApiError(false);
      } catch (err) {
        setApiError(true);
      }
    }
    void fetchStats();
  }, []);

  return (
    <div className="w-full px-0 py-0">
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-zinc-500">Overview of the FashionSwap marketplace.</p>
      {apiError ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Live API unreachable — showing no live data.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-zinc-500">Users</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.users}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-sm text-zinc-500">Listings</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.listings}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-zinc-500">Orders</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.orders}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <span className="text-sm text-zinc-500">Activity</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">+{stats.growth}%</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Recent listings</h2>
        <div className="mt-3 space-y-2">
          {stats.recent.length === 0 ? (
            <p className="text-sm text-zinc-500">No listings available yet.</p>
          ) : stats.recent.map((listing, index) => (
            <div key={`${listing.title}-${index}`} className="flex items-center justify-between rounded border border-zinc-100 px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-zinc-900">{listing.title}</p>
                <p className="text-zinc-500">{listing.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-zinc-900">₹{listing.price}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{listing.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
