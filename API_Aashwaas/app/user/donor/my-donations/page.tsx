"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import Link from "next/link";
import Card from "@/app/(platform)/_components/Card";
import Badge from "@/app/(platform)/_components/Badge";
import ConfirmDialog from "@/app/(platform)/_components/ConfirmDialog";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import { DonationsApi } from "@/lib/api/donor/donations";

type Donation = {
  _id?: string;
  itemName?: string;
  category?: string;
  description?: string;
  quantity?: string;
  condition?: string;
  pickupLocation?: string;
  media?: string;
  status?: string;
  createdAt?: string;
};

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  let pushToast: ((toast: { title: string; description?: string; tone: any }) => void) | undefined;
  try {
    // useToast throws when no ToastProvider present; catch and continue without toasts
    const _ctx = useToast();
    pushToast = _ctx.pushToast;
  } catch (e) {
    pushToast = undefined;
  }

  useEffect(() => {
    let mounted = true;
    async function fetchMyDonations() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/donations/my");
        const data = (res.data && (res.data.data ?? res.data)) || [];
        if (mounted) setDonations(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err?.response?.data?.message || err.message || "Failed to load donations");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchMyDonations();
    return () => { mounted = false };
  }, []);

  const availableStatuses = Array.from(new Set(donations.map((d) => (d.status || "Pending") as string)));
  const filteredDonations = donations.filter((d) => {
    if (statusFilter === "all") return true;
    return ((d.status || "Pending").toString().toLowerCase() === statusFilter);
  });

  const handleConfirmDelete = async (id: string) => {
    setPendingDeleteId(null);
    setDeletingId(id);
    try {
      await DonationsApi.remove(id);
      setDonations((prev) => prev.filter((it) => ((it as any)._id || (it as any).id) !== id));
      if (pushToast) pushToast({ title: "Donation cancelled", description: "Your donation was removed.", tone: "success" });
    } catch (e: any) {
      if (pushToast) pushToast({ title: "Unable to cancel", description: e?.message || "Try again", tone: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Donations</h1>
          <p className="text-sm text-gray-600">Track and manage all your donations</p>
        </div>
        <div className="flex items-center gap-3">
          {donations.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                {availableStatuses.map((s) => (
                  <option key={s} value={(s || "").toString().toLowerCase()}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <Link href="/user/donor/donation" className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Add Donation
          </Link>
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-rose-600">{error}</div>}

      {!loading && donations.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-700">You haven't added any donations yet.</div>
      )}

      

      {donations.length > 0 && filteredDonations.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-700 mt-4">No donations match the selected status.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <ConfirmDialog
          open={!!pendingDeleteId}
          title="Confirm cancel"
          description="Are you sure you want to cancel this donation? This action cannot be undone."
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => pendingDeleteId ? handleConfirmDelete(pendingDeleteId) : undefined}
          confirmLabel="Cancel donation"
          loading={!!(pendingDeleteId && deletingId === pendingDeleteId)}
        />
        {filteredDonations.map((d, idx) => {
          const bannerTones = ["bg-sky-200", "bg-emerald-200", "bg-amber-200"];
          const bannerTone = bannerTones[idx % bannerTones.length];
          return (
            <Card key={d._id} noPadding className="overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="relative h-40 w-full rounded-md overflow-hidden mb-3">
                    {d.media ? (
                      <img
                        src={`${(axios.defaults && (axios.defaults as any).baseURL) ? (axios.defaults as any).baseURL : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050")}/item_photos/${d.media}`}
                        alt={d.itemName || "photo"}
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          // try a relative path once (useful when backend is proxied)
                          if (!(img.dataset as any).triedRelative) {
                            (img.dataset as any).triedRelative = '1';
                            img.src = `/item_photos/${d.media}`;
                            return;
                          }
                          img.src = '/images/user.png';
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`absolute inset-0 ${bannerTone} flex items-center justify-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-package">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73L13 3l-7 3.27A2 2 0 0 0 5 8v8a2 2 0 0 0 1 1.73L11 21l7-3.27A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                          <line x1="12" y1="22" x2="12" y2="12"></line>
                        </svg>
                      </div>
                    )}

                    <span className="absolute left-4 top-4 inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-900 backdrop-blur">
                      {d.quantity ?? '1'} items
                    </span>

                    <span className="absolute right-4 top-4">
                      <Badge label={d.status || "Pending"} tone={"pending"} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{d.itemName}</h2>
                    <p className="text-sm text-gray-600 mt-1">{d.category}</p>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">{d.category || 'Other'}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-700 line-clamp-2">{d.description}</p>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  <span>Condition: <span className="text-gray-800 font-medium">{d.condition || 'Unknown'}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 11-9 11s-9-4-9-11a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{d.pickupLocation || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"></path>
                    <path d="M7 10l5-3 5 3"></path>
                  </svg>
                  <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
              
                {String(d.status || '').toLowerCase() === 'pending' && (
                  <div className="mt-5 flex gap-3">
                    <Link href={`/user/donor/donation/${d._id}`} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-95">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => setPendingDeleteId(d._id ?? null)}
                      disabled={deletingId === (d._id || undefined)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 ${deletingId === (d._id || undefined) ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      {deletingId === (d._id || undefined) ? (
                        <svg className="h-4 w-4 animate-spin text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" />
                          <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" stroke="currentColor" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                        </svg>
                      )}
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
