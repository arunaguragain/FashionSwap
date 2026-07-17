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
  cancelOrder,
} from '../../lib/api';
import SkeletonOrder from '../../components/common/SkeletonOrder';
import Protected from '../../components/common/Protected';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { CheckCircle2, Clock3, Package, ArrowRight, Sparkles, Ban, Mail, Phone, MapPin, Truck, User } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

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
  
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');

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

  const handleCancelOrder = async (order: any) => {
    setActionLoading(order._id || order.id);
    try {
      await cancelOrder(order._id || order.id);
      pushToast({ title: 'Order cancelled', tone: 'success' });
      await loadOrders();
    } catch (e: any) {
      pushToast({ title: 'Cancel failed', description: e.message || 'Please try again.', tone: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const isSeller = userId === getUserId(o.sellerId);
    const isBuyer = userId === getUserId(o.buyerId);
    if (activeTab === 'purchases') return isBuyer;
    return isSeller;
  });

  const renderActions = (order: any) => {
    const isSeller = userId && getUserId(order.sellerId) === userId;
    const isBuyer = userId && getUserId(order.buyerId) === userId;
    const status = order.status || 'created';

    if (status === 'created') {
      return (
        <div className="flex flex-wrap gap-2">
          {isSeller && (
            <>
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
            </>
          )}
          {isBuyer && (
             <button
             type="button"
             onClick={() => handleCancelOrder(order)}
             disabled={actionLoading === (order._id || order.id)}
             className="inline-flex items-center gap-2 border border-border bg-white px-5 py-2.5 rounded-[14px] text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-70"
           >
             {actionLoading === (order._id || order.id) ? 'Working…' : 'Cancel Order'}
           </button>
          )}
        </div>
      );
    }

    if (status === 'accepted') {
      const hasBuyerConfirmed = order.transaction?.buyerConfirmed;
      const hasSellerConfirmed = order.transaction?.sellerConfirmed;

      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {isBuyer && !hasBuyerConfirmed && (
            <button
              type="button"
              onClick={() => handleTransactionAction(order, 'delivery')}
              disabled={actionLoading === (order._id || order.id)}
              className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-70"
            >
              {actionLoading === (order._id || order.id) ? 'Working…' : 'Mark as Received'}
            </button>
          )}
          {isBuyer && hasBuyerConfirmed && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-sage/12 text-sage-dark border border-sage/20"><CheckCircle2 className="h-4 w-4" /> Received</span>
          )}
          {isSeller && !hasSellerConfirmed && (
            <button
              type="button"
              onClick={() => handleTransactionAction(order, 'handover')}
              disabled={actionLoading === (order._id || order.id)}
              className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-70"
            >
              {actionLoading === (order._id || order.id) ? 'Working…' : 'Mark as Delivered'}
            </button>
          )}
          {isSeller && hasSellerConfirmed && (
             <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-sage/12 text-sage-dark border border-sage/20"><CheckCircle2 className="h-4 w-4" /> Delivered</span>
          )}
          {!isBuyer && !isSeller && (
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-sand text-ink border border-sand-dark">Waiting for next step</span>
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

    if (status === 'declined' || status === 'cancelled') {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 uppercase tracking-wider">
            <Ban className="h-4 w-4" /> {status}
          </span>
        );
      }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-parchment-dark px-4 py-2 text-sm font-medium text-ink uppercase tracking-wider">
        <Clock3 className="h-4 w-4" /> Awaiting seller response
      </span>
    );
  };

  return (
    <Protected>
      <div className="w-full px-6 py-10 md:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
            Orders
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>My orders</h1>
          <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">Follow each exchange from offer to handoff in one calm view.</p>
        </div>

        <div className="flex border-b border-border mb-8">
            <button
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchases' ? 'border-terracotta text-terracotta' : 'border-transparent text-charcoal-soft hover:text-charcoal'}`}
                onClick={() => setActiveTab('purchases')}
            >
                Orders Placed (Purchases)
            </button>
            <button
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sales' ? 'border-terracotta text-terracotta' : 'border-transparent text-charcoal-soft hover:text-charcoal'}`}
                onClick={() => setActiveTab('sales')}
            >
                Orders Received (Sales)
            </button>
        </div>

        {loading && (
          <div className="space-y-4">
            <SkeletonOrder />
            <SkeletonOrder />
          </div>
        )}

        {error && <div className="rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-600 mb-6">{error}</div>}

        {!loading && filteredOrders.length === 0 && (
             <div className="flex flex-col items-center justify-center bg-white rounded-[20px] border border-border/60 p-16 text-center">
             <div className="relative mb-6">
               <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-terracotta/10">
                 <Package className="h-9 w-9 text-terracotta" />
               </div>
               <div className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-sage/12">
                 <Sparkles className="h-4 w-4 text-sage" />
               </div>
             </div>
 
             <h2 className="font-display text-2xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>No {activeTab} yet</h2>
             <p className="mt-3 max-w-sm text-sm text-ink leading-relaxed">
               {activeTab === 'purchases' ? 'When you buy an item, your order will appear here.' : 'When someone buys your item, their order will appear here.'}
             </p>
 
             <Link
               href="/listings"
               className="mt-8 inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3.5 rounded-[14px] text-[15px] font-medium hover:bg-terracotta-dark transition-colors"
             >
               Browse listings
               <ArrowRight className="h-4 w-4" />
             </Link>
           </div>
        )}

        {!loading && filteredOrders.length > 0 && (
             <div className="space-y-4">
             {filteredOrders.map((o) => {
               const id = o._id || o.id;
               const listingTitle = o.listingId?.title || 'Listing';
               const status = o.status || 'created';
               const buyerName = getPersonName(o.buyerId);
               const sellerName = getPersonName(o.sellerId);
               const role = activeTab === 'sales' ? 'Seller' : 'Buyer';
               const badgeClasses =
                 status === 'completed'
                   ? 'bg-sage/12 text-sage-dark'
                   : status === 'accepted'
                   ? 'bg-terracotta/12 text-terracotta-dark'
                   : status === 'declined' || status === 'cancelled'
                   ? 'bg-red-100 text-red-700'
                   : 'bg-parchment-dark text-ink';
   
               return (
                 <div
                   key={id}
                   className="flex flex-col md:flex-row gap-6 p-6 rounded-[20px] bg-white border border-border/60 hover:shadow-sm transition-shadow"
                 >
                   <div className="w-full md:w-32 h-32 shrink-0 rounded-[14px] overflow-hidden bg-sand-light">
                     {o.listingId?.images?.[0] ? (
                       <img src={o.listingId.images[0]} alt={listingTitle} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-ink/40 bg-sand">
                         <Package size={24} className="mb-1" />
                         <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                       </div>
                     )}
                   </div>
   
                   <div className="flex-1 flex flex-col min-w-0">
                     <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                       <div>
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${badgeClasses}`}>
                           {status}
                         </span>
                         <h3 className="font-display text-xl font-bold text-charcoal line-clamp-1">{listingTitle}</h3>
                       </div>
                       <div className="text-right">
                         <p className="text-sm text-ink mb-1">Total</p>
                         <p className="font-display text-xl font-bold text-charcoal">Rs. {o.price?.toLocaleString() || 0}</p>
                       </div>
                     </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-6 mt-auto pt-4 border-t border-border/40">
                        {/* Contact Info Block */}
                        <div className="bg-sand/30 rounded-xl p-4 flex flex-col gap-3">
                          <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {role === 'Seller' ? 'Buyer Details' : 'Seller Details'}
                          </h4>
                          
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center shrink-0">
                               <User className="w-4 h-4 text-charcoal-soft" />
                            </div>
                            <div>
                               <p className="text-xs text-ink mb-0.5">Name</p>
                               <p className="text-sm font-medium text-charcoal">{role === 'Seller' ? buyerName : sellerName}</p>
                            </div>
                          </div>
                          
                          {(role === 'Seller' ? o.buyerId?.email : o.sellerId?.email) && (
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center shrink-0">
                                 <Mail className="w-4 h-4 text-charcoal-soft" />
                              </div>
                              <div>
                                 <p className="text-xs text-ink mb-0.5">Email</p>
                                 <p className="text-sm font-medium text-charcoal">{role === 'Seller' ? o.buyerId?.email : o.sellerId?.email}</p>
                              </div>
                            </div>
                          )}

                          {(role === 'Seller' ? o.buyerId?.phone : o.sellerId?.phone) && (
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center shrink-0">
                                 <Phone className="w-4 h-4 text-charcoal-soft" />
                              </div>
                              <div>
                                 <p className="text-xs text-ink mb-0.5">Phone</p>
                                 <p className="text-sm font-medium text-charcoal">{role === 'Seller' ? o.buyerId?.phone : o.sellerId?.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Delivery Info Block */}
                        <div className="bg-sand/30 rounded-xl p-4 flex flex-col gap-3">
                          <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            Delivery Details
                          </h4>

                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center shrink-0">
                               <Package className="w-4 h-4 text-charcoal-soft" />
                            </div>
                            <div>
                               <p className="text-xs text-ink mb-0.5">Method</p>
                               <p className="text-sm font-medium text-charcoal capitalize">{o.deliveryMethod?.replace(/_/g, ' ') || 'N/A'}</p>
                            </div>
                          </div>

                          {o.deliveryMethod === 'meet_at_location' && o.meetingLocation && (
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center shrink-0">
                                 <MapPin className="w-4 h-4 text-charcoal-soft" />
                              </div>
                              <div>
                                 <p className="text-xs text-ink mb-0.5">Meeting Location</p>
                                 <p className="text-sm font-medium text-charcoal leading-snug break-words">{o.meetingLocation}</p>
                              </div>
                            </div>
                          )}

                          {o.deliveryMethod === 'cash_on_delivery' && o.deliveryAddress && (
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-parchment flex items-center justify-center shrink-0">
                                 <MapPin className="w-4 h-4 text-charcoal-soft" />
                              </div>
                              <div>
                                 <p className="text-xs text-ink mb-0.5">Delivery Address</p>
                                 <p className="text-sm font-medium text-charcoal leading-snug break-words">{o.deliveryAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
    
                      {renderActions(o)}
                   </div>
                 </div>
               );
             })}
           </div>
        )}
      </div>
    </Protected>
  );
}
