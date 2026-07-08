"use client";

import React, { useEffect, useState } from 'react';
import { getOrders } from '../../lib/api';
import SkeletonOrder from '../../components/common/SkeletonOrder';
import Protected from '../../components/common/Protected';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ensure authenticated
  // we'll wrap page in Protected via client component

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOrders();
        setOrders(res?.data ?? res ?? []);
      } catch (e: any) {
        setError(e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Protected>
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
      {loading && (
        <div className="space-y-3">
          <SkeletonOrder />
          <SkeletonOrder />
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <div className="font-medium">Order {o.id}</div>
              <div className="text-sm text-gray-600">Total: ${o.total}</div>
            </div>
            <div className="text-sm text-gray-700">{o.status}</div>
          </div>
        ))}
      </div>
    </div>
    </Protected>
  );
}
