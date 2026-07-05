"use client";

import { useState, useEffect } from "react";
// Utility to get today's date in yyyy-mm-dd format
function getToday() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleCreateWishlist, handleGetWishlist, handleUpdateWishlist } from "@/lib/actions/donor/wishlist-actions";
import { WishlistModel, WishlistType } from "@/app/(platform)/wishlists/schemas";
import { WishlistSchema } from "@/app/(platform)/wishlists/schemas";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

type Props = { wishlistId?: string | null; onSuccess?: () => void };

export default function WishlistForm({ wishlistId, onSuccess }: Props) {
  const router = useRouter();
  const params = useParams();
  const effectiveId = wishlistId ?? (params && (params as any).id) ?? null;


  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const _toastCtx = (() => {
    try { return useToast(); } catch (e) { return null; }
  })();
  const pushToast = _toastCtx ? _toastCtx.pushToast : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<WishlistType>({
    resolver: zodResolver(WishlistSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      category: "Other",
      plannedDate: "",
      notes: "",
      donorId: "",
      status: "active"
    }
  });

  useEffect(() => {
    if (!effectiveId) return;
    setLoadingItem(true);
    handleGetWishlist(effectiveId)
      .then((res) => {
        if (res.success && res.data) {
          const raw = res.data as any;
          const donorId = raw?.donorId && typeof raw.donorId === "object" ? (raw.donorId.id ?? raw.donorId._id ?? String(raw.donorId)) : raw?.donorId;
          // Normalize plannedDate to yyyy-mm-dd for the date input
          let plannedDate = raw?.plannedDate ?? "";
          if (plannedDate) {
            // Normalize to yyyy-mm-dd for date input
            const d = new Date(plannedDate);
            if (!Number.isNaN(d.getTime())) {
              plannedDate = d.toISOString().slice(0, 10);
            } else {
              plannedDate = String(plannedDate).slice(0, 10);
            }
          } else {
            plannedDate = "";
          }
          reset({ ...raw, donorId, plannedDate, status: raw.status ?? "active" });
        } else setError(res.message || "Failed to load wishlist");
      })
      .catch((e) => setError(e?.message || "Failed to load wishlist"))
      .finally(() => setLoadingItem(false));
  }, [effectiveId, reset]);


  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (effectiveId) res = await handleUpdateWishlist(effectiveId, data);
      else res = await handleCreateWishlist(data);
      if (res.success) {
        setLoading(false);
        if (onSuccess) onSuccess();
        if (pushToast) pushToast({ title: effectiveId ? "Wishlist updated" : "Wishlist added", description: res.message || undefined, tone: "success" });
        router.push("/user/donor/wishlist");
        return;
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to save";
      setError(msg);
      if (pushToast) pushToast({ title: "Failed to save wishlist", description: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{effectiveId ? "Edit Wishlist" : "Add Wishlist"}</h1>
        <p className="text-sm text-gray-600">{effectiveId ? "Update wishlist item" : "Create a new wishlist item"}</p>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          {(loading || loadingItem) && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/70 p-6">
              <div className="w-full max-w-3xl animate-pulse">
                <div className="h-6 w-1/3 rounded bg-gray-200" />
                <div className="mt-4 h-8 w-full rounded bg-gray-200" />
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="h-8 rounded bg-gray-200" />
                  <div className="h-8 rounded bg-gray-200" />
                </div>
                <div className="mt-3 h-40 rounded bg-gray-200" />
              </div>
            </div>
          )}

        <div>
          <label className="text-sm font-semibold text-gray-900">Title</label>
          <input
            {...register("title")}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
          />
          {errors.title && <div className="mt-1 text-xs text-rose-600">{errors.title.message as string}</div>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900">Category</label>
            <select
              {...register("category")}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            >
              <option value="Clothes">Clothes</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <div className="mt-1 text-xs text-rose-600">{errors.category.message as string}</div>}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">Planned Date</label>
            <input
              type="date"
              {...register("plannedDate")}
              min={getToday()}
              max={undefined}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            {errors.plannedDate && <div className="mt-1 text-xs text-rose-600">{errors.plannedDate.message as string}</div>}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900">Notes</label>
          <textarea
            {...register("notes")}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
          />
          {errors.notes && <div className="mt-1 text-xs text-rose-600">{errors.notes.message as string}</div>}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {loading ? (effectiveId ? "Saving..." : "Adding...") : (effectiveId ? "Save changes" : "Add Wishlist")}
          </button>
          <Link href="/user/donor/wishlist" className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
