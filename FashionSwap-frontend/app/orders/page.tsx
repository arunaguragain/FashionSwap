"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  acceptOrder,
  confirmDelivery,
  confirmHandover,
  declineOrder,
  getOrders,
  getTransactionByOrderId,
} from '../../lib/api';
import SkeletonOrder from '../../components/common/SkeletonOrder';
import Protected from '../../components/common/Protected';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { CheckCircle2, Clock3, Handshake, Sparkles, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function getUserId(user: any) {
  return user?._id || user?.id || null;
}

function getPersonName(person: any) {
  return person?.firstName || person?.name || person?.fullName || 'Unknown';
}

export default function OrdersPage() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { pushToast } = useToast();
  const ordersInitializedRef = useRef(false);

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
    // Guard against Strict Mode double invocation
    if (ordersInitializedRef.current) return;
    ordersInitializedRef.current = true;

    void loadOrders();
  }, []);

  const handleSellerDecision = async (order: any, accept: boolean) => {
    setActionLoading(order._id || order.id);
    try {
      if (accept) {
        await acceptOrder(order._id || order.id);
        pushToast({ title: 'Order accepted', tone: 'success' });
      } else {
        await declineOrder(order._id || order.id);
        pushToast({ title: 'Order declined', tone: 'success' });
      }
      await loadOrders();
    } catch (e: any) {
      pushToast({ title: 'Action failed', description: e.message || 'Please try again.', tone: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransactionAction = async (order: any, action: 'delivery' | 'handover') => {
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

  const renderActions = (order: any) => {
    const buyerId = getUserId(order.buyerId);
    const sellerId = getUserId(order.sellerId);
    const isSeller = userId && sellerId === userId;
    const isBuyer = userId && buyerId === userId;
    const status = order.status || 'created';

    if (status === 'created' && isSeller) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSellerDecision(order, true)}
            disabled={actionLoading === (order._id || order.id)}
            className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-70"
          >
            {actionLoading === (order._id || order.id) ? 'Working…' : 'Accept order'}
          </button>
          <button
            type="button"
            onClick={() => handleSellerDecision(order, false)}
            disabled={actionLoading === (order._id || order.id)}
            className="inline-flex items-center gap-2 border border-border bg-white px-5 py-2.5 rounded-[14px] text-sm font-medium text-charcoal-soft hover:bg-parchment-dark transition-colors disabled:opacity-70"
          >
            {actionLoading === (order._id || order.id) ? 'Working…' : 'Decline order'}
          </button>
        </div>
      );
    }

    if (status === 'accepted') {
      return (
        <div className="flex flex-wrap gap-2">
          {isBuyer && (
            <button
              type="button"
              onClick={() => handleTransactionAction(order, 'delivery')}
              disabled={actionLoading === (order._id || order.id)}
              className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-70"
            >
              {actionLoading === (order._id || order.id) ? 'Working…' : 'Confirm delivery'}
            </button>
          )}
          {isSeller && (
            <button
              type="button"
              onClick={() => handleTransactionAction(order, 'handover')}
              disabled={actionLoading === (order._id || order.id)}
              className="inline-flex items-center gap-2 border border-border bg-white px-5 py-2.5 rounded-[14px] text-sm font-medium text-charcoal-soft hover:bg-parchment-dark transition-colors disabled:opacity-70"
            >
              {actionLoading === (order._id || order.id) ? 'Working…' : 'Confirm handover'}
            </button>
          )}
          {!isBuyer && !isSeller && (
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-sand text-ink">Waiting for next step</span>
          )}
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/12 px-4 py-2 text-sm font-medium text-sage-dark uppercase tracking-wider">
          <CheckCircle2 className="h-4 w-4" /> Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-parchment-dark px-4 py-2 text-sm font-medium text-ink uppercase tracking-wider">
        <Clock3 className="h-4 w-4" /> Awaiting seller response
      </span>
    );
  };

  if (!loading && orders.length === 0) {
    return (
      <Protected>
        <div className="w-full px-6 py-10 md:px-8">
          <div className="mb-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
              Orders
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>My orders</h1>
            <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">No orders yet. Browse listings and make an offer to get started.</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-white rounded-[20px] border border-border/60 p-16 text-center">
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-terracotta/10">
                <Package className="h-9 w-9 text-terracotta" />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-sage/12">
                <Sparkles className="h-4 w-4 text-sage" />
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>No orders yet</h2>
            <p className="mt-3 max-w-sm text-sm text-ink leading-relaxed">
              When you make an offer on a listing and the seller accepts, your order will appear here.
            </p>

            <Link
              href="/listings"
              className="mt-8 inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3.5 rounded-[14px] text-[15px] font-medium hover:bg-terracotta-dark transition-colors"
            >
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <div className="w-full px-6 py-10 md:px-8">
        <div className="mb-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
            Orders
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>My orders</h1>
          <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">Follow each exchange from offer to handoff in one calm view.</p>
        </div>

        {loading && (
          <div className="space-y-4">
            <SkeletonOrder />
            <SkeletonOrder />
          </div>
        )}

        {error && <div className="rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        <div className="space-y-4">
          {orders.map((o) => {
            const id = o._id || o.id;
            const listingTitle = o.listingId?.title || 'Listing';
            const status = o.status || 'created';
            const buyerName = getPersonName(o.buyerId);
            const sellerName = getPersonName(o.sellerId);
            const role = userId === getUserId(o.sellerId) ? 'Seller' : userId === getUserId(o.buyerId) ? 'Buyer' : 'Participant';
            const badgeClasses =
              status === 'completed'
                ? 'bg-sage/12 text-sage-dark'
                : status === 'accepted'
                ? 'bg-terracotta/12 text-terracotta-dark'
                : 'bg-parchment-dark text-ink';

            return (
              <div
                key={id}
                className="group listing-card flex flex-col justify-between gap-4 rounded-[20px] border border-border/60 bg-white p-6 md:flex-row md:items-center"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-charcoal">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-terracotta/10">
                      <ShoppingBag className="h-5 w-5 text-terracotta" />
                    </div>
                    <span className="font-display text-lg font-bold" style={{ letterSpacing: '-0.01em' }}>{listingTitle}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="text-sm text-ink">Offer: <span className="font-semibold text-charcoal">Rs. {o.offerPrice ?? o.total ?? 0}</span></div>
                    <div className="text-sm text-ink">Your role: <span className="font-semibold text-charcoal">{role}</span></div>
                    <div className="text-sm text-ink">Buyer: <span className="font-semibold text-charcoal">{buyerName}</span></div>
                    <div className="text-sm text-ink">Seller: <span className="font-semibold text-charcoal">{sellerName}</span></div>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${badgeClasses}`}>
                    {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : status === 'accepted' ? <Handshake className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    <span>{status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">{renderActions(o)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Protected>
  );
}
