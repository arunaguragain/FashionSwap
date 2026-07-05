"use client";

import { TrendingUp, Award, Package } from "lucide-react";
import Card from "@/app/(platform)/_components/Card";
import Badge from "@/app/(platform)/_components/Badge";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import ReviewItem from "../reviews/_components/ReviewItem";
import { handleListReviews } from "@/lib/actions/donor/review-actions";
import { handleMyWishlists } from "@/lib/actions/donor/wishlist-actions";
import WishlistItem from "../wishlist/_components/WishlistItem";
import { handleListDonorDonations } from "@/lib/actions/donor/donation-actions";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

type Donation = {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  ngoId?: string;
  status: string;
  pickupDate?: string;
  pickupTime?: string;
  pickupLocation?: string;
  description?: string;
  condition?: string;
  imageUrl?: string;
  createdAt?: string;
  media?: string;
};

const DonorDashboardPage = () => {
  const auth = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
    const [wishlists, setWishlists] = useState<any[]>([]);
    const [wishlistsLoading, setWishlistsLoading] = useState(true);
    const [wishlistsError, setWishlistsError] = useState("");

  useEffect(() => {
    async function fetchDonations() {
      setLoading(true);
      const donorId = auth.user?._id || auth.user?.id;
      const res = await handleListDonorDonations(donorId ? { donorId } : undefined);
      if (res.success) {
        const items = (res.data ?? []).map((d: any) => ({
          ...d,
          quantity: typeof d.quantity === "string" ? Number(d.quantity) : d.quantity,
        }));
        // Ensure we only show donations belonging to the current donor 
        const currentDonorId = donorId;
        const filtered = currentDonorId
          ? items.filter((it: any) => {
              const cand = it.donorId ?? it.donor ?? it.donor_id ?? it.user;
              if (!cand) return false;
              if (typeof cand === "string") return String(cand) === String(currentDonorId);
              if (typeof cand === "object") return String(cand._id ?? cand.id ?? cand.toString()) === String(currentDonorId);
              return false;
            })
          : items;
        setDonations(filtered);
        setError("");
      } else {
        setError(res.message || "Failed to load donations");
      }
      setLoading(false);
    }
    async function fetchReviews() {
      setReviewsLoading(true);
      const res = await handleListReviews({ page: 1, perPage: 50 });
      if (res.success) {
        setReviews(res.data ?? []);
        setReviewsError("");
      } else {
        setReviewsError(res.message || "Failed to load reviews");
      }
      setReviewsLoading(false);
    }
    fetchDonations();
    fetchReviews();
      async function fetchWishlists() {
        setWishlistsLoading(true);
        const res = await handleMyWishlists({ page: 1, perPage: 50 });
        if (res.success) {
          setWishlists(res.data ?? []);
          setWishlistsError("");
        } else {
          setWishlistsError(res.message || "Failed to load wishlists");
        }
        setWishlistsLoading(false);
      }
      fetchWishlists();
  }, [auth.user]);

  // Calculate stats
  const totalDonations = donations.length;
  const impactScore = totalDonations * 10;
  const upcomingPickups = donations.filter(d => d.status === "assigned" || d.status === "pending");

  const formatDate = (d?: string) => {
    if (!d) return "TBD";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  // Build chart data for last N days
  const buildChartData = useCallback((items: Donation[], days = 30) => {
    const out: { name: string; Donations: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const sum = items.reduce((s, it) => {
        const created = it.pickupDate || it.pickupTime || (it as any).createdAt;
        if (!created) return s;
        const dt = new Date(created).toDateString();
        if (dt === key) return s + (Number(it.quantity) || 0);
        return s;
      }, 0);
      out.push({ name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), Donations: sum });
    }
    return out;
  }, []);

  const chartData = useMemo(() => buildChartData(donations, 30), [donations, buildChartData]);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    donations.forEach(d => {
      const key = d.category || 'Other';
      map[key] = (map[key] || 0) + (Number(d.quantity) || 0);
    });
    return Object.entries(map).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [donations]);
  const PIE_COLORS = ['#1E3A8A', '#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

  return (
    <div>
      <div className="mb-6 p-4 rounded-lg border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Aashwaas!</h1>
          <p className="text-gray-700 mb-2">Thank you for making a difference. Here you can track your donations, see your impact, and watch your growth as a valued donor.</p>
        </div>
        <button
          className="inline-flex items-center rounded-lg bg-blue-600  px-4 py-2 text-sm font-semibold text-white hover:opacity-95 shadow transition"
          onClick={() => window.location.href='/donor/add-donation'}
        >
          Donate Now
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <Card className="overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-base font-semibold text-gray-700">Total Donations</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{totalDonations}</span>
            <Badge label="Donations" tone="info" />
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-6 w-6 text-yellow-600" />
            <span className="text-base font-semibold text-gray-700">Impact Score</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{impactScore}</span>
            <Badge label="Impact" tone="warning" />
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-base font-semibold text-gray-700">Growth</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{upcomingPickups.length}</span>
            <Badge label="Growth" tone="success" />
          </div>
        </Card>
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Donations</h2>
          <a href="/donor/my-donations" className="text-blue-600 hover:underline text-sm font-medium">View All</a>
        </div>
        {loading ? (
          <div className="text-gray-500">Loading donations…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : donations.length === 0 ? (
          <div className="text-gray-500">No donations found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {donations.slice(0, 3).map((d, idx) => {
              const bannerTones = ["bg-sky-200", "bg-emerald-200", "bg-amber-200"];
              const bannerTone = bannerTones[idx % bannerTones.length];
              return (
                <Card key={d._id} noPadding className="overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="relative h-40 w-full rounded-md overflow-hidden mb-3">
                        {d.media ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}/item_photos/${d.media}`}
                            alt={d.itemName || "photo"}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={e => {
                              const img = e.currentTarget;
                              if (!img.dataset.triedRelative) {
                                img.dataset.triedRelative = '1';
                                img.src = `/item_photos/${d.media}`;
                              } else {
                                img.src = '/images/user.png';
                              }
                            }}
                          />
                        ) : (
                          <div className={`absolute inset-0 ${bannerTone} flex items-center justify-center`}>
                {/* Reviews Section */}
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-500 bg-clip-text text-transparent">Reviews & Feedback</h2>
                    <a href="/user/donor/reviews" className="text-indigo-600 hover:text-purple-500 hover:underline text-sm font-medium transition-colors">View All</a>
                  </div>
                  <div className="mb-2">
                    <span className="text-lg font-semibold text-indigo-700">Your voice matters!</span>
                    <span className="ml-2 text-base text-gray-700">See what other donors are saying, <span className="text-indigo-600 font-medium">share your experience</span> to help us improve.</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium text-indigo-700">We value your feedback.</span> Reviews help us build a better platform for all donors and NGOs.
                  </p>
                  {reviewsLoading ? (
                    <div className="text-gray-500">Loading reviews…</div>
                  ) : reviewsError ? (
                    <div className="text-red-500">{reviewsError}</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-gray-400 italic">No reviews found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {reviews.slice(0, 3).map((review) => (
                        <ReviewItem key={review._id} review={review} />
                      ))}
                    </div>
                  )}
                </div>
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
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {/* Reviews Section*/}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Reviews & Feedback</h2>
          <a href="/user/donor/reviews" className="text-blue-600 hover:underline text-sm font-medium">View All</a>
        </div>
        <p className="text-gray-800 text-base font-medium mb-2">Your voice matters! See what other donors & volunteers are saying, and share your experience to help us improve.</p>
        <p className="text-gray-500 text-sm mb-4">We value your feedback. Reviews help us build a better platform for all donors, volunteers and NGOs.</p>
        {reviewsLoading ? (
          <div className="text-gray-500">Loading reviews…</div>
        ) : reviewsError ? (
          <div className="text-red-500">{reviewsError}</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-400 italic">No reviews found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
        {/* Wishlist Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Wishlist</h2>
            <a href="/user/donor/wishlist" className="text-blue-600 hover:underline text-sm font-medium">View All</a>
          </div>
          <p className="text-gray-800 text-base font-medium mb-2">Keep track of items you wish to donate or support. Add, edit, or fulfill your wishlist anytime!</p>
          {wishlistsLoading ? (
            <div className="text-gray-500">Loading wishlist…</div>
          ) : wishlistsError ? (
            <div className="text-red-500">{wishlistsError}</div>
          ) : wishlists.length === 0 ? (
            <div className="text-gray-400 italic">No wishlist items found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wishlists.slice(0, 3).map((w, idx) => (
                <WishlistItem key={w._id || idx} item={w} showActions={false} />
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default DonorDashboardPage;
