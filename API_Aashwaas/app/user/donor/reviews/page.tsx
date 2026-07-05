"use client";

import React, { useEffect, useState } from "react";
import ConfirmDialog from "@/app/(platform)/_components/ConfirmDialog";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import ReviewForm from "./_components/ReviewForm";
import ReviewItem from "./_components/ReviewItem";
import { handleCreateReview, handleListReviews, handleListMyReviews, handleRemoveReview, handleUpdateReview } from "@/lib/actions/donor/review-actions";
import { useAuth } from "@/context/AuthContext";
import type { ReviewModel } from "@/app/(platform)/reviews/schemas";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReviewModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const auth = useAuth();

  const resolveUserId = (u: any) => u?._id ?? u?.id ?? u;

  const parseJwt = (token: string | null) => {
    if (!token) return null;
    try {
      const base = token.split(".")[1];
      const json = atob(base.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const getTokenUserId = () => {
    if (typeof document === "undefined") return null;
    const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
    const tok = m ? decodeURIComponent(m[1]) : null;
    const payload = parseJwt(tok);
    return payload ? (payload._id ?? payload.id ?? payload.sub ?? payload.userId ?? null) : null;
  };

  const [tokenUserId, setTokenUserId] = useState<string | null>(null);
  useEffect(() => {
    setTokenUserId(getTokenUserId());
  }, []);
  const sessionMismatch = !!(auth?.user && tokenUserId && String(resolveUserId(auth.user)) !== String(tokenUserId));

  const isOwner = (review: any, userOrId: any) => {
    if (!review) return false;
    const userIdToCheck = typeof userOrId === "string" ? String(userOrId) : String(resolveUserId(userOrId));
    if (!userIdToCheck) return false;
    const rid = review?.userId ?? review?.user ?? review?.user_id ?? null;
    if (!rid) return false;
    const rId = typeof rid === "object" ? (rid._id ?? rid.id ?? (rid.toString ? rid.toString() : "")) : String(rid);
    return String(rId) === String(userIdToCheck);
  };

  const toastCtx = (() => {
    try {
      return useToast();
    } catch (e) {
      return null;
    }
  })();

  const pushToast = toastCtx ? toastCtx.pushToast : undefined;

  const loadReviews = async (currentFilter: "all" | "mine" = filter) => {
    let mounted = true;
    setLoading(true);
    setError(null);
    try {
      const fn = currentFilter === "mine" ? handleListMyReviews : handleListReviews;
      const res = await fn({ page: 1, perPage: 50 });
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        if (mounted) setReviews(list);
      } else {
        if (mounted) setError(res.message || "Failed to load reviews");
      }
    } catch (err: any) {
      if (mounted) setError(err?.message || "Failed to load reviews");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false };
  };

  useEffect(() => {
    loadReviews(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);


  const handleCreate = async (payload: { rating: number; comment?: string }) => {
    setSubmitting(true);
    try {
      const res = await handleCreateReview(payload);
      if (res.success && res.data) {
        try {
          await loadReviews(filter);
        } catch (e) {
          setReviews((p) => [res.data as ReviewModel, ...p]);
        }
        setShowForm(false);
        if (pushToast) pushToast({ title: "Review added", tone: "success" });
      } else {
        if (pushToast) pushToast({ title: "Unable to add review", description: res.message, tone: "error" });
      }
    } catch (err: any) {
      if (pushToast) pushToast({ title: "Unable to add review", description: err?.message || "Try again", tone: "error" });
    }
    setSubmitting(false);
  };

  const getId = (obj: any) => obj?._id ?? obj?.id ?? "";

  const handleStartEdit = (r: ReviewModel) => {
    setEditing(r);
    setShowForm(true);
  };

  const handleSubmitEdit = async (payload: { rating: number; comment?: string }) => {
    if (!editing) return;
    if (sessionMismatch) {
      setActionError("Session token does not match stored user — please log out and log in.");
      return;
    }
    setActionError(null);
    setSubmitting(true);
    const id = getId(editing);
    try {
      const res = await handleUpdateReview(id, payload);
      if (res.success && res.data) {
        if (auth?.user && !isOwner(res.data, auth.user)) {
          const msg = "Server indicates you do not own this review — update not permitted";
          setActionError(msg);
          console.error("Ownership mismatch after update:", res.data);
          const ref = await (filter === "mine" ? handleListMyReviews({ page: 1, perPage: 50 }) : handleListReviews({ page: 1, perPage: 50 }));
          if (ref.success && Array.isArray(ref.data)) setReviews(ref.data);
          if (pushToast) pushToast({ title: "Unable to update", description: msg, tone: "error" });
        } else {
          setReviews((prev) => prev.map((it) => (getId(it) === id ? (res.data as ReviewModel) : it)));
          setEditing(null);
          setShowForm(false);
          if (pushToast) pushToast({ title: "Review updated", tone: "success" });
        }
      } else {
        const msg = res.message || "Unable to update review";
        setActionError(msg);
        console.error("Update failed:", res);
        // if server returned 403 (not authorized), remove this review from the list and refresh
        if (res.status === 403) {
          setReviews((prev) => prev.filter((it) => getId(it) !== id));
          try {
            await loadReviews(filter);
          } catch (e) {}
        }
        if (pushToast) pushToast({ title: "Unable to update", description: msg, tone: "error" });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Unable to update review";
      setActionError(msg);
      console.error("Update error:", err);
      if (pushToast) pushToast({ title: "Unable to update", description: msg, tone: "error" });
    }
    setSubmitting(false);
  };

  const handleConfirmDelete = async (id: string) => {
    setActionError(null);
    setPendingDeleteId(null);
    if (sessionMismatch) {
      setActionError("Session token does not match stored user — please log out and log in.");
      return;
    }
    setDeletingId(id);
    try {
      const res = await handleRemoveReview(id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        if (pushToast) pushToast({ title: "Review removed", tone: "success" });
      } else {
        const msg = res.message || "Unable to remove review";
        setActionError(msg);
        console.error("Remove failed:", res);
        if (pushToast) pushToast({ title: "Unable to remove", description: msg, tone: "error" });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Unable to remove review";
      setActionError(msg);
      console.error("Remove error:", err);
      if (pushToast) pushToast({ title: "Unable to remove", description: msg, tone: "error" });
    }
    setDeletingId(null);
    // refresh according to current filter
    try { await loadReviews(filter); } catch (e) {}
  };

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-600">View and manage reviews</p>
          {actionError && <div className="mt-2 text-sm text-rose-600">{actionError}</div>}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              className={`px-3 py-1 text-sm font-medium rounded-full transition ${filter === "all" ? "bg-blue-200 text-blue-800" : "text-gray-700 hover:bg-blue-50"}`}
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
            >
              All
            </button>
            <button
              className={`ml-1 px-3 py-1 text-sm font-medium rounded-full transition ${filter === "mine" ? "bg-blue-200 text-blue-800" : "text-gray-700 hover:bg-blue-50"}`}
              onClick={() => setFilter("mine")}
              aria-pressed={filter === "mine"}
            >
              My Reviews
            </button>
          </div>
          <button onClick={() => { setShowForm((s) => !s); setEditing(null); }} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {showForm ? "Close" : "Add Review"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 w-full md:w-1/2">
          <ReviewForm initial={editing ? { rating: editing.rating, comment: editing.comment } : undefined} onCancel={() => { setShowForm(false); setEditing(null); }} onSubmit={editing ? handleSubmitEdit : handleCreate} submitting={submitting} submitLabel={editing ? "Update review" : "Add review"} />
        </div>
      )}

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-rose-600">{error}</div>}

      {!loading && reviews.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-700">No reviews available.</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 mt-4">
        <ConfirmDialog
          open={!!pendingDeleteId}
          title="Confirm delete"
          description="Are you sure you want to delete this review? This action cannot be undone."
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => (pendingDeleteId ? handleConfirmDelete(pendingDeleteId) : undefined)}
          confirmLabel="Delete review"
          loading={!!(pendingDeleteId && deletingId === pendingDeleteId)}
        />

        {reviews.map((r) => {
          const canModify = !sessionMismatch && (tokenUserId ? isOwner(r, tokenUserId) : isOwner(r, auth.user));
          return (
            <ReviewItem
              key={getId(r)}
              review={r}
              onEdit={canModify ? handleStartEdit : undefined}
              onDelete={canModify ? (id) => setPendingDeleteId(id) : undefined}
              deleting={deletingId === getId(r)}
              canModify={canModify}
            />
          );
        })}
      </div>
    </div>
  );
}
