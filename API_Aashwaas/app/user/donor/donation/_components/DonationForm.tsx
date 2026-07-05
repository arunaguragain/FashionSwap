"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/api/axios";
import { handleCreateDonorDonation, handleGetDonorDonation, handleUpdateDonorDonation } from "@/lib/actions/donor/donation-actions";
import { DonationModel } from "@/app/(platform)/donations/schemas";
import { WishlistApi } from "@/lib/api/donor/wishlist";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

type DonationFormProps = {
  donationId?: string | null;
  onSuccess?: () => void;
};

export default function DonationForm({ donationId, onSuccess }: DonationFormProps) {
  const router = useRouter();
  const params = useParams();
  // prefer explicit prop, fall back to route param
  const effectiveId = donationId ?? (params && (params as any).id) ?? null;

  const initialForm: Omit<DonationModel, "_id"> = {    itemName: "",
    category: "Books",
    description: "",
    quantity: "",
    condition: "New",
    pickupLocation: "",
    media: "",
    donorId: "",
    ngoId: "",
    status: "pending",
  };

  const [form, setForm] = useState<Omit<DonationModel, "_id">>(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingDonation, setLoadingDonation] = useState(false);
  const [prefillWishlist, setPrefillWishlist] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const _toastCtx = (() => {
    try { return useToast(); } catch (e) { return null; }
  })();
  const pushToast = _toastCtx ? _toastCtx.pushToast : undefined;

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!form.itemName) errors.itemName = "Item name is required.";
    if (!form.quantity || isNaN(Number(form.quantity))) errors.quantity = "Quantity must be a number.";
    if (!form.pickupLocation) errors.pickupLocation = "Pickup location is required.";
    return errors;
  };
  const validationErrors = validate();

  // preload donation when editing (use effectiveId which falls back to route param)
  useEffect(() => {
    if (!effectiveId) return;
    setLoadingDonation(true);

    // Primary attempt: fetch donation by id
    handleGetDonorDonation(effectiveId)
      .then((res) => {
        if (res.success && res.data) {
          const d: any = res.data;
          setForm({
            itemName: d.itemName || d.title || "",
            category: d.category || "Books",
            description: d.description || "",
            quantity: String(d.quantity ?? ""),
            condition: d.condition || "New",
            pickupLocation: d.pickupLocation || "",
            media: d.media || "",
            donorId: d.donorId || "",
            ngoId: d.ngoId || "",
            status: d.status || "pending",
          });
          if (d.media) {
            const base = (axios.defaults && (axios.defaults as any).baseURL)
              ? (axios.defaults as any).baseURL
              : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050");
            setPhotoPreview(`${base}/item_photos/${d.media}`);
          }
          setError(null);
        } else {
          // If direct GET fails (e.g. 404), try the donor's list as a fallback
          setError(res.message || "Failed to load donation — trying fallback...");
          return Promise.reject(new Error(res.message || "not-found"));
        }
      })
      .catch(async (err: any) => {
        // fallback: fetch /api/donations/my and attempt to locate the donation
        try {
          const listRes = await axios.get("/api/donations/my");
          const all = (listRes.data && (listRes.data.data ?? listRes.data)) || [];
          const found = Array.isArray(all) ? all.find((x: any) => (x._id || x.id) === effectiveId) : null;
          if (found) {
            const d: any = found;
            setForm({
              itemName: d.itemName || d.title || "",
              category: d.category || "Books",
              description: d.description || "",
              quantity: String(d.quantity ?? ""),
              condition: d.condition || "New",
              pickupLocation: d.pickupLocation || "",
              media: d.media || "",
              donorId: d.donorId || "",
              ngoId: d.ngoId || "",
              status: d.status || "pending",
            });
            if (d.media) {
              const base = (axios.defaults && (axios.defaults as any).baseURL)
                ? (axios.defaults as any).baseURL
                : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050");
              setPhotoPreview(`${base}/item_photos/${d.media}`);
            }
            setError(null);
            return;
          }

          // final: show clear error to user
          setError(err?.response?.data?.message || err?.message || "Donation not found or you don't have access.");
        } catch (fallbackErr: any) {
          setError(fallbackErr?.response?.data?.message || fallbackErr?.message || "Donation not found or you don't have access.");
        }
      })
      .finally(() => setLoadingDonation(false));
  }, [effectiveId]);

  // Prefill from wishlist when creating a new donation via ?wishlistId=...
  const searchParams = useSearchParams();
  useEffect(() => {
    if (effectiveId) return; // do not override when editing
    const wishlistId = searchParams?.get?.("wishlistId");
    if (!wishlistId) return;
    setLoadingDonation(true);
    WishlistApi.getById(wishlistId)
      .then((res) => {
        const w = res?.data ?? res;
        setPrefillWishlist(w);
        setForm((prev) => ({
          ...prev,
          itemName: w.title || prev.itemName,
          category: w.category || prev.category,
          description: w.notes || prev.description,
          quantity: String((w.quantity ?? prev.quantity ?? 1)),
          media: w.imageUrl || prev.media,
          donorId: w.donorId?._id || w.donorId || prev.donorId,
        }));
        if (w.imageUrl) setPhotoPreview(w.imageUrl);
      })
      .catch(() => {})
      .finally(() => setLoadingDonation(false));
  }, [searchParams, effectiveId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // reveal validation messages for all required fields when the user attempts to submit
    setTouched({ itemName: true, quantity: true, pickupLocation: true });
    // If you add a date picker, also set touched for date field here for consistency
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("itemName", form.itemName);
      formData.append("category", form.category);
      formData.append("description", form.description ?? "");
      formData.append("quantity", form.quantity);
      formData.append("condition", form.condition);
      formData.append("pickupLocation", form.pickupLocation);
      if (photoFile) formData.append("donationPhoto", photoFile);

      let res: any;
      if (effectiveId) {
        res = await handleUpdateDonorDonation(effectiveId, formData);
      } else {
        const wishlistId = searchParams?.get?.("wishlistId");
        if (wishlistId) formData.append("wishlistId", wishlistId);
        res = await handleCreateDonorDonation(formData);
      }

      if (res.success) {
        setSuccess(true);
        setTouched({});
        setPhotoFile(null);
        if (!effectiveId) {
          setForm(initialForm);
          setPhotoPreview(null);
        }
        if (onSuccess) onSuccess();
        else {
          const wishlistId = searchParams?.get?.("wishlistId");
          if (wishlistId) {
            setTimeout(() => router.push("/user/donor/wishlist"), 300);
          } else {
            setTimeout(() => router.push("/user/donor/my-donations"), 700);
          }
        }
        if (pushToast) pushToast({ title: effectiveId ? "Donation updated" : "Donation added", description: res.message || undefined, tone: "success" });
      } else {
        if (pushToast) pushToast({ title: "Failed to save donation", description: res.message || undefined, tone: "error" });
        // helpful message when backend doesn't support donor update
        if ((res as any).status === 404 || /not ?found/i.test(res.message || "")) {
          setError("Update endpoint not available on the server (404). Editing donations is not supported — delete and re-create or contact the backend.");
        } else {
          setError(res.message || (effectiveId ? "Failed to update donation" : "Failed to add donation"));
        }
      }
    } catch (err: any) {
      const msg = err?.message || (effectiveId ? "Failed to update donation" : "Failed to add donation");
      setError(msg);
      if (pushToast) pushToast({ title: "Failed to save donation", description: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{effectiveId ? "Edit Donation" : "Add Donation"}</h1>
        <p className="text-sm text-gray-600">{effectiveId ? "Update donation details" : "Fill out the form to donate an item"}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <div>{error}</div>
          {effectiveId && (
            <div className="mt-2">
              <Link href="/user/donor/my-donations" className="text-sm font-semibold text-sky-600 hover:underline">Back to My Donations</Link>
            </div>
          )}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{effectiveId ? "Donation updated successfully!" : "Donation added successfully!"}</div>
      )}

      <form onSubmit={handleSubmit} className="relative space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {(loading || loadingDonation) && (
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

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="itemName">Item Name</label>
            <input
              id="itemName"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || loadingDonation}
              placeholder="e.g. Winter Jacket"
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            {touched.itemName && validationErrors.itemName && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.itemName}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={loading || loadingDonation}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            >
              <option value="Clothes">Clothes</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="description">Description <span className="text-xs text-gray-400">(optional)</span></label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading || loadingDonation}
            placeholder="Describe the item"
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || loadingDonation}
              min={1}
              placeholder="Enter quantity"
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            {touched.quantity && validationErrors.quantity && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.quantity}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              disabled={loading || loadingDonation}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="pickupLocation">Pickup Location</label>
          <input
            id="pickupLocation"
            name="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading || loadingDonation}
            placeholder="Enter pickup location"
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
          />
          {touched.pickupLocation && validationErrors.pickupLocation && (
            <p className="mt-1 text-xs text-rose-600">{validationErrors.pickupLocation}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="mediaFile">Upload Image</label>
          <input
            id="mediaFile"
            name="mediaFile"
            type="file"
            accept="image/*"
            disabled={loading || loadingDonation}
            required={!photoPreview}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                setForm(prev => ({ ...prev, media: file.name }));
                setPhotoFile(file);
                setPhotoPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>
        {photoPreview && (
          <div>
            <p className="text-sm font-semibold text-gray-900">Preview</p>
            <div className="mt-3 max-w-sm rounded-lg border border-gray-200 p-2">
              <img src={photoPreview} alt="Donation photo preview" className="h-32 w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setForm(prev => ({ ...prev, media: "" }));
                }}
                disabled={loading || loadingDonation}
                className="mt-2 text-xs font-semibold text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || loadingDonation}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? (effectiveId ? "Saving..." : "Adding...") : (effectiveId ? "Save changes" : "Add Donation")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (loading) return;
              setForm(initialForm);
              setTouched({});
              setPhotoFile(null);
              setPhotoPreview(null);
              setError(null);
              setSuccess(false);
              // go back to previous page
              router.back();
            }}
            disabled={loading || loadingDonation}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
