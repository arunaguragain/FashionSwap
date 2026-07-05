"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "@/lib/api/axios";
import { getUserById } from "@/lib/api/admin/user";
import ReactDOM from "react-dom";
import Link from "next/link";
import ConfirmDialog from "@/app/(platform)/_components/ConfirmDialog";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import { AdminDonationsApi } from "@/lib/api/admin/donations";

type Donation = any;

const donationCategories = [
  'Clothes', 'Books', 'Electronics', 'Furniture', 'Food', 'Other'
];

interface DonationsTableProps {
  initialDonations: Donation[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  query?: string;
  category?: string;
}

export default function DonationsTable({ initialDonations, loading = false, onDelete, onRefresh, query = "", category = "" }: DonationsTableProps) {
  const [items, setItems] = useState<Donation[]>(initialDonations || []);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(7);
  const [page, setPage] = useState(1);
  const [filterHost, setFilterHost] = useState<HTMLElement | null>(null);
  // the hook signature currently requires a dummy object even though it is unused
  const { pushToast } = useToast({ title: '', tone: 'info' });

  // Fetch donor names if only donorId is present and donorName is missing
  useEffect(() => {
    setItems(initialDonations || []);
    (async () => {
      const updated = await Promise.all((initialDonations || []).map(async (donation) => {
        if (
          !donation.donorName &&
          donation.donorId &&
          typeof donation.donorId === 'string' &&
          !donation.donor
        ) {
          try {
            const user = await getUserById(donation.donorId);
            return { ...donation, donorName: user?.name || user?.fullName || "—" };
          } catch {
            return { ...donation };
          }
        }
        return donation;
      }));
      setItems(updated);
    })();
  }, [initialDonations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const hay = `${i.itemName || i.title || ""} ${i.donorName || ""} ${i.city || i.pickupLocation || ""}`.toLowerCase();
      const matchesQuery = !q || hay.includes(q) || (i.status || "").toLowerCase().includes(q);
      const matchesCategory = !category || (i.category === category);
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

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
      if (onDelete) {
        await Promise.resolve(onDelete(id));
      } else {
        await AdminDonationsApi.remove(id);
        setItems((prev) => prev.filter((it) => (it.id || it._id) !== id));
      }
      pushToast({ title: 'Donation deleted', description: 'Deleted successfully', tone: 'success' });
      onRefresh && onRefresh();
    } catch (e: any) {
      pushToast({ title: 'Unable to delete donation', description: e?.message || '', tone: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const host = document.getElementById("donations-filters-host");
    if (host) setFilterHost(host);
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await AdminDonationsApi.approve(id);
      pushToast({ title: 'Donation approved', description: '', tone: 'success' });
      onRefresh && onRefresh();
    } catch (e: any) {
      pushToast({ title: 'Unable to approve', description: e?.message || '', tone: 'error' });
    }
  };

  const handleAssign = async (id: string) => {
    const volunteerId = window.prompt('Enter volunteer id to assign to this donation');
    if (!volunteerId) return;
    try {
      await AdminDonationsApi.assign(id, volunteerId);
      pushToast({ title: 'Volunteer assigned', description: '', tone: 'success' });
      // notify user that email will be sent to volunteer
      pushToast({ title: 'Volunteer has been notified by e‑mail', tone: 'info' });
      onRefresh && onRefresh();
    } catch (e: any) {
      pushToast({ title: 'Unable to assign volunteer', description: e?.message || '', tone: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Confirm delete"
        description="Are you sure you want to delete this donation? This action cannot be undone."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId ? handleConfirmDelete(pendingDeleteId) : undefined}
        loading={!!(pendingDeleteId && deletingId === pendingDeleteId)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
        <div>
          <table className="w-full">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-800">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-600" colSpan={6}>Loading donations...</td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-600" colSpan={6}>No donations found.</td>
                </tr>
              ) : (
                  paged.map((don: Donation, idx: number) => (
                  <tr key={don.id || don._id} className="text-sm text-gray-800 hover:bg-gray-100">
                    <td className="px-4 py-4">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-4 py-4">
                      <img
                        src={don.media ? `${(axios.defaults && (axios.defaults as any).baseURL ? (axios.defaults as any).baseURL : "http://localhost:5050")}/item_photos/${don.media}` : "/images/user.png"}
                        alt={don.title || don.itemName || "Donation image"}
                        className="h-10 w-10 rounded object-cover border border-gray-200 bg-gray-100"
                        onError={e => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (!(img.dataset as any).triedRelative) {
                            (img.dataset as any).triedRelative = '1';
                            img.src = `/item_photos/${don.media}`;
                            return;
                          }
                          console.warn('Failed to load donation media:', don.media, img.src);
                          img.src = "/images/user.png";
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">{don.title || don.itemName}</td>
                    <td className="px-4 py-4 text-gray-700">{
                      (() => {
                        // Dashboard-style fallback chain for donor name
                        const donor = don.donorName ?? don.donorId ?? don.donor;
                        if (!donor) return "—";
                        if (typeof donor === "string") return donor;
                        return donor.name || donor.email || donor._id || "—";
                      })()
                    }</td>
                    <td className="px-4 py-4 text-gray-700">{don.city || don.pickupLocation || "—"}</td>
                    <td className="px-4 py-4 text-gray-700">{don.status}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-nowrap items-center gap-1">
                        <Link href={`/admin/donations/${don.id || don._id}`} className="inline-flex items-center justify-center rounded-full bg-amber-100 border border-amber-200 text-amber-800 hover:bg-amber-200 shadow-sm px-2 py-1 text-xs font-medium" title="View">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                         {(don.status === 'pending') && (
                           <>
                             <button onClick={() => handleApprove(don.id || don._id)} className="inline-flex items-center justify-center rounded-full bg-sky-100 border border-sky-200 text-sky-800 hover:bg-sky-200 shadow-sm px-2 py-1 text-xs font-medium">Approve</button>
                             <Link
                               href={`/admin/donations/${don.id || don._id}`}
                               className="inline-flex items-center justify-center rounded-full bg-sky-100 border border-sky-200 text-sky-800 hover:bg-sky-200 shadow-sm px-2 py-1 text-xs font-medium"
                             >
                               Assign
                             </Link>
                           </>
                         )}
                         {don.status === 'approved' && (
                           <Link
                             href={`/admin/donations/${don.id || don._id}`}
                             className="inline-flex items-center justify-center rounded-full bg-sky-100 border border-sky-200 text-sky-800 hover:bg-sky-200 shadow-sm px-2 py-1 text-xs font-medium"
                           >
                             Assign
                           </Link>
                         )}
                        <button type="button" onClick={() => setPendingDeleteId(don.id || don._id)} className={`inline-flex items-center justify-center rounded-full bg-rose-100 border border-rose-200 text-rose-800 hover:bg-rose-200 shadow-sm px-2 py-1 text-xs font-medium ${deletingId === (don.id || don._id) ? 'opacity-60 pointer-events-none' : ''}`} title="Delete">
                          {deletingId === (don.id || don._id) ? (
                            <svg className="h-4 w-4 animate-spin text-rose-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" /><path d="M22 12a10 10 0 00-10-10" strokeWidth="3" stroke="currentColor" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3h4l1 4H9l1-4z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing {paged.length} of {total} entries</div>
        <div className="flex items-center gap-2">
          <button
            className={page <= 1
              ? "rounded border border-gray-700 bg-gray-700 px-3 py-1 text-sm text-white opacity-80 cursor-not-allowed"
              : "rounded border border-transparent bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700"
            }
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>

          {(() => {
            const pagesToShow: number[] = [];
            const start = Math.max(1, page - 2);
            const end = Math.min(pages, page + 2);
            if (start > 1) pagesToShow.push(1);
            if (start > 2) pagesToShow.push(-1);
            for (let i = start; i <= end; i++) pagesToShow.push(i);
            if (end < pages - 1) pagesToShow.push(-1);
            if (end < pages) pagesToShow.push(pages);
            return pagesToShow.map((pnum, i) =>
              pnum === -1 ? (
                <span key={`e-${i}`} className="px-2 text-sm text-gray-500">…</span>
              ) : (
                <button
                  key={pnum}
                  onClick={() => setPage(pnum)}
                  className={`rounded px-3 py-1 text-sm ${pnum === page ? "bg-sky-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  {pnum}
                </button>
              )
            );
          })()}

          <button
            className={page >= pages
              ? "rounded border border-gray-700 bg-gray-700 px-3 py-1 text-sm text-white opacity-80 cursor-not-allowed"
              : "rounded border border-transparent bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700"
            }
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
