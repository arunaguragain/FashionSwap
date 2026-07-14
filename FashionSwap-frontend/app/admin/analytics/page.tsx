
"use client";
import React, { useEffect, useState } from "react";
import { getUsers } from "@/lib/api/admin/user";
import { getListings, getOrders } from "@/lib/api";
import { FaGift, FaUsers, FaStore, FaShoppingCart } from "react-icons/fa";

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    listings: 0,
    orders: 0,
    users: 0,
    listingsPrev: 0,
    ordersPrev: 0,
    usersPrev: 0,
  });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [userResRaw, listingsRes, ordersRes] = await Promise.all([getUsers(), getListings(), getOrders()]);
        const userRes: any = userResRaw;
        const usersPayload = userRes as any;
        const listingsPayload = listingsRes as any;
        const ordersPayload = ordersRes as any;
        const users = Array.isArray(usersPayload) ? usersPayload : Array.isArray(usersPayload?.data) ? usersPayload.data : [];
        const listings = Array.isArray(listingsPayload?.data) ? listingsPayload.data : Array.isArray(listingsPayload) ? listingsPayload : [];
        const orders = Array.isArray(ordersPayload?.data) ? ordersPayload.data : Array.isArray(ordersPayload) ? ordersPayload : [];

        const now = new Date();
        const getCount = (arr: any[], daysAgoStart: number, daysAgoEnd: number, dateField = "createdAt") => {
          const start = new Date(now);
          start.setDate(now.getDate() - daysAgoStart);
          const end = new Date(now);
          end.setDate(now.getDate() - daysAgoEnd);
          return arr.filter((x) => {
            const dt = x[dateField] ? new Date(x[dateField]) : null;
            return dt && dt >= end && dt < start;
          }).length;
        };

        setMetrics({
          listings: listings.length,
          orders: orders.length,
          users: users.length,
          listingsPrev: getCount(listings, 14, 7),
          ordersPrev: getCount(orders, 14, 7),
          usersPrev: getCount(users, 14, 7),
        });
        setRecentListings(listings.slice(0, 5));
        setRecentOrders(orders.slice(0, 5));
      } catch (e) {
        setMetrics({ listings: 0, orders: 0, users: 0, listingsPrev: 0, ordersPrev: 0, usersPrev: 0 });
      }
      setLoading(false);
    }
    void fetchData();
  }, []);

  const getGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return (
    <div className="space-y-6 p-2 md:p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white shadow border border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <FaStore className="text-green-500 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? "--" : metrics.listings}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Active Listings</div>
          <div className="text-xs mt-1 text-green-600">{getGrowth(metrics.listings, metrics.listingsPrev)}%</div>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <FaShoppingCart className="text-purple-500 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? "--" : metrics.orders}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Orders</div>
          <div className="text-xs mt-1 text-green-600">{getGrowth(metrics.orders, metrics.ordersPrev)}%</div>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <FaUsers className="text-orange-400 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? "--" : metrics.users}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Registered Users</div>
          <div className="text-xs mt-1 text-green-600">{getGrowth(metrics.users, metrics.usersPrev)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Listings</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : recentListings.length === 0 ? (
            <div className="text-gray-500">No listings yet.</div>
          ) : (
            <ul className="space-y-2">
              {recentListings.map((listing, index) => (
                <li key={`${listing._id || listing.id || index}`} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{listing.title || "Untitled listing"}</p>
                    <p className="text-gray-500">{listing.category || "General"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{listing.askingPrice ?? listing.price ?? 0}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{listing.status || "available"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-gray-500">No orders yet.</div>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((order, index) => (
                <li key={`${order._id || order.id || index}`} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{order.listing?.title || order.title || "Order"}</p>
                    <p className="text-gray-500">{order.status || "pending"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.totalAmount ?? order.amount ?? 0}</p>
                    <p className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
