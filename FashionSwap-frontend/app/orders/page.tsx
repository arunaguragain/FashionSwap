"use client";

import React, { useEffect, useState } from 'react';
import { confirmDelivery, confirmHandover, getOrders, getTransactionByOrderId } from '../../lib/api';
import SkeletonOrder from '../../components/common/SkeletonOrder';
import Protected from '../../components/common/Protected';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { CheckCircle2, Clock3, Handshake, Sparkles } from 'lucide-react';

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Orders</p>
          <h1 className="mt-2 font-headline text-3xl text-on-surface">My orders</h1>
          <p className="mt-2 text-sm leading-7 text-on-surface-variant">Follow each exchange from offer to handoff in one calm view.</p>
        </div>
        {loading && (
          <div className="space-y-3">
            <SkeletonOrder />
            <SkeletonOrder />
          </div>
        )}
        {error && <div className="rounded-[1.25rem] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>}
        <div className="space-y-4">
          {orders.map((o) => {
            const id = o._id || o.id;
            const listingTitle = o.listingId?.title || 'Listing';
            const status = o.status || 'created';
            const badgeClasses = status === 'completed' ? 'bg-secondary/10 text-secondary' : status === 'accepted' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant';
            return (
              <div key={id} className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-outline/15 bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(27,28,25,0.04)] md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2 text-on-surface">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{listingTitle}</span>
                  </div>
                  <div className="mt-2 text-sm text-on-surface-variant">Offer: ₹{o.offerPrice ?? o.total ?? 0}</div>
                  <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${badgeClasses}`}>
                    {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : status === 'accepted' ? <Handshake className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    <span className="capitalize">{status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {status === 'accepted' && (
                    <>
                      <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-70" onClick={() => onCompleteAction(o, 'delivery')} disabled={actionLoading === id}>{actionLoading === id ? 'Working...' : 'Confirm Delivery'}</button>
                      <button className="rounded-full border border-outline/20 bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant" onClick={() => onCompleteAction(o, 'handover')} disabled={actionLoading === id}>{actionLoading === id ? 'Working...' : 'Confirm Handover'}</button>
                    </>
                  )}
                  {status === 'completed' && <span className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">Completed</span>}
                  {!['accepted', 'completed'].includes(status) && <span className="rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-on-surface-variant">Awaiting seller response</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Protected>
  );
}
