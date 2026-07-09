"use client";

import React, { useEffect, useState } from 'react';
import { confirmDelivery, confirmHandover, getOrders, getTransactionByOrderId } from '../../lib/api';
import SkeletonOrder from '../../components/common/SkeletonOrder';
import Protected from '../../components/common/Protected';
import { useToast } from '@/app/(platform)/_components/ToastProvider';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { pushToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      const payload = (res as any)?.data ?? res ?? [];
      setOrders(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const onCompleteAction = async (order: any, action: 'delivery' | 'handover') => {
    setActionLoading(order._id || order.id);
    try {
      const transactionRes = await getTransactionByOrderId(order._id || order.id);
      const transaction = (transactionRes as any)?.data ?? transactionRes ?? null;
      if (!transaction) throw new Error('Transaction not found');
      if (action === 'delivery') {
        await confirmDelivery(transaction._id || transaction.id);
        pushToast({ title: 'Delivery confirmed', tone: 'success' });
      } else {
        await confirmHandover(transaction._id || transaction.id);
        pushToast({ title: 'Handover confirmed', tone: 'success' });
      }
      await loadOrders();
    } catch (e: any) {
      pushToast({ title: 'Action failed', description: e.message || 'Please try again.', tone: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Protected>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">My Orders</h1>
        {loading && (
          <div className="space-y-3">
            <SkeletonOrder />
            <SkeletonOrder />
          </div>
        )}
        {error && <div className="text-red-600">{error}</div>}
        <div className="space-y-4">
          {orders.map((o) => {
            const id = o._id || o.id;
            const listingTitle = o.listingId?.title || 'Listing';
            const status = o.status || 'created';
            return (
              <div key={id} className="flex flex-col justify-between gap-3 rounded bg-white p-4 shadow md:flex-row md:items-center">
                <div>
                  <div className="font-medium">{listingTitle}</div>
                  <div className="text-sm text-gray-600">Offer: ₹{o.offerPrice ?? o.total ?? 0}</div>
                  <div className="text-sm text-gray-500">Status: {status}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {status === 'accepted' && (
                    <>
                      <button className="rounded bg-primary-900 px-3 py-2 text-sm text-white" onClick={() => onCompleteAction(o, 'delivery')} disabled={actionLoading === id}>{actionLoading === id ? 'Working...' : 'Confirm Delivery'}</button>
                      <button className="rounded border border-gray-300 px-3 py-2 text-sm" onClick={() => onCompleteAction(o, 'handover')} disabled={actionLoading === id}>{actionLoading === id ? 'Working...' : 'Confirm Handover'}</button>
                    </>
                  )}
                  {status === 'completed' && <span className="text-sm text-green-700">Completed</span>}
                  {!['accepted', 'completed'].includes(status) && <span className="text-sm text-slate-500">Awaiting seller response</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Protected>
  );
}
