"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { deleteAdminOrder } from "@/lib/api/admin/orders";
import ConfirmDialog from "@/app/(platform)/_components/ConfirmDialog";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

type Order = any;

const resolvePhotoUrl = (value: string) => {
  if (!value) return "/images/placeholder.png";
  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/")) return value;
  return `http://localhost:5050/item_photos/${value}`;
};

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [items, setItems] = useState<Order[]>(initialOrders || []);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [perPage] = useState(10);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterHost, setFilterHost] = useState<HTMLElement | null>(null);
  const { pushToast } = useToast();

  useEffect(() => setItems(initialOrders || []), [initialOrders]);

  useEffect(() => {
    const host = document.getElementById("orders-filters-host");
    if (host) setFilterHost(host);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((o) => {
      const text = `${o.listingId?.title || ""} ${o.buyerId?.firstName || ""} ${o.buyerId?.lastName || ""} ${o.sellerId?.firstName || ""} ${o.sellerId?.lastName || ""} ${o.status || ""}`;
      return !q || text.toLowerCase().includes(q);
    });
  }, [items, query]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [pages, page]);

  const handleConfirmDelete = async (id: string) => {
    setPendingDeleteId(null);
    setDeletingId(id);
    try {
      const res = await deleteAdminOrder(id);
      if (res?.success === false) {
        throw new Error(res.message || "Failed to delete");
      }
      setItems((prev) => prev.filter((it) => (it._id || it.id) !== id));
      pushToast({ title: "Order deleted", description: "Order deleted successfully", tone: "success" });
    } catch (e: any) {
      pushToast({ title: "Unable to delete order", description: e?.message || "", tone: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'created': return 'bg-blue-100 text-blue-700';
          case 'accepted': return 'bg-indigo-100 text-indigo-700';
          case 'completed': return 'bg-green-100 text-green-700';
          case 'declined':
          case 'cancelled': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Confirm delete"
        description="Are you sure you want to delete this order? This action cannot be undone."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId ? handleConfirmDelete(pendingDeleteId) : undefined}
        loading={!!(pendingDeleteId && deletingId === pendingDeleteId)}
      />
      
      {(() => {
        const filterNode = (
          <div className="flex items-center gap-3">
            <input
              aria-label="Search orders"
              placeholder="Search by item, buyer, seller, status..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-72 rounded-md border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
        );
        return filterHost ? ReactDOM.createPortal(filterNode, filterHost) : <div>{filterNode}</div>;
      })()}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-200 sticky top-0 z-10">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-800">
              <th className="px-4 py-3 w-16">No</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
            {paged.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-600" colSpan={7}>No orders found.</td>
              </tr>
            ) : (
              paged.map((order: Order, idx: number) => {
                const listingTitle = order.listingId?.title || "Unknown Item";
                const photo = order.listingId?.images && order.listingId.images.length > 0 ? order.listingId.images[0] : "";
                const src = resolvePhotoUrl(photo);
                const buyerName = order.buyerId ? `${order.buyerId.firstName || ""} ${order.buyerId.lastName || ""}`.trim() : "Unknown";
                const sellerName = order.sellerId ? `${order.sellerId.firstName || ""} ${order.sellerId.lastName || ""}`.trim() : "Unknown";
                
                return (
                  <tr key={order._id || order.id} className="text-sm text-gray-800 hover:bg-gray-100">
                    <td className="px-4 py-4">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded bg-gray-100 overflow-hidden">
                         <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1 max-w-[150px]" title={listingTitle}>{listingTitle}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{buyerName}</td>
                    <td className="px-4 py-4 text-gray-700">{sellerName}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900">Rs. {order.price ?? 0}</td>
                    <td className="px-4 py-4 text-gray-700">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status || "Unknown"}
                        </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(order._id || order.id)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors ${deletingId === (order._id || order.id) ? 'opacity-50 pointer-events-none' : ''}`}
                          title="Delete Order"
                        >
                          <span className="sr-only">Delete</span>
                          {deletingId === (order._id || order.id) ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" /><path d="M22 12a10 10 0 00-10-10" strokeWidth="3" stroke="currentColor" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3h4l1 4H9l1-4z" />
                            </svg>
                          )}
                        </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing {paged.length} of {total} entries</div>
        <div className="flex items-center gap-2">
          <button
            className={page <= 1 ? "rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-400 cursor-not-allowed" : "rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700 px-2">Page {page} of {pages}</span>
          <button
            className={page >= pages ? "rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-400 cursor-not-allowed" : "rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
