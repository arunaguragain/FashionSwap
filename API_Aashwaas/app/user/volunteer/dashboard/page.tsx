
"use client";


import { TrendingUp, Award, Package } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { fetchVolunteerTasks } from '@/lib/actions/volunteer/task-actions';
import { VolunteerTask } from '@/app/(platform)/tasks/schemas';
import { useAuth } from '@/context/AuthContext';
import NgoCard from '@/app/(platform)/_components/NgoCard';
import Card from '@/app/(platform)/_components/Card';
import Badge from '@/app/(platform)/_components/Badge';
import ReviewItem from '@/app/user/donor/reviews/_components/ReviewItem';
import axios from '@/lib/api/axios';
import { API } from '@/lib/api/endpoints';
import { ReviewsApi } from '@/lib/api/reviews';

export default function VolunteerDashboard() {

  const auth = useAuth();
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NGO and Review state
  const [ngos, setNgos] = useState<any[]>([]);
  const [ngosLoading, setNgosLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchVolunteerTasks();
        if (!mounted) return;
        setTasks(data || []);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load tasks');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function fetchNgos() {
      setNgosLoading(true);
      try {
        const res = await axios.get(API.NGO.LIST);
        const payload = res?.data;
        const data = Array.isArray(payload) ? payload : payload?.data ?? [];
        if (mounted) setNgos(data);
      } catch (e) {
        console.error("Failed to load NGOs", e);
      } finally {
        if (mounted) setNgosLoading(false);
      }
    }

    async function fetchReviews() {
      setReviewsLoading(true);
      try {
        const res = await ReviewsApi.list({ page: 1, perPage: 50 });
        if (mounted) setReviews(res.data ?? []);
        setReviewsError("");
      } catch (e: any) {
        if (mounted) setReviewsError(e?.message || "Failed to load reviews");
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    }

    load();
    fetchNgos();
    fetchReviews();
    return () => { mounted = false; };
  }, []);

  const totalTasks = auth.user?.totalTasks ?? tasks.length;
  const impactPoints = auth.user?.impactPoints ?? (tasks.filter(t => t.status === 'completed').length * 10);
  const completedTasks = auth.user?.completedTasks ?? tasks.filter(t => t.status === 'completed').length;
  const upcoming = tasks.filter(t => (t.status === 'assigned' || t.status === 'accepted')).length;


  return (
    <div>

      <div className="mb-6 p-4 rounded-lg border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Aashwaas!</h1>
          <p className="text-gray-700 mb-2">Thank you for making a difference. Here you can track your tasks, see your impact, and watch your growth as a valued volunteer.</p>
        </div>
        <button
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 shadow transition mt-4 sm:mt-0"
          onClick={() => window.location.href='/user/volunteer/my-tasks'}
        >
          View My Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <Card className="overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-base font-semibold text-gray-700">Total Tasks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{totalTasks}</span>
            <Badge label="Tasks" tone="info" />
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-6 w-6 text-yellow-600" />
            <span className="text-base font-semibold text-gray-700">Impact Points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{impactPoints}</span>
            <Badge label="Impact" tone="warning" />
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-base font-semibold text-gray-700">Upcoming Shifts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{upcoming}</span>
            <Badge label="Upcoming" tone="success" />
          </div>
        </Card>
      </div>

      {/* NGO Directory Preview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">NGO Directory</h2>
          <a href="/user/volunteer/ngos" className="text-blue-600 hover:underline text-sm font-medium">View All</a>
        </div>
        <p className="text-sm text-gray-500 mb-4">Browse NGOs registered on the platform</p>
        {ngosLoading ? (
          <div className="text-gray-500">Loading NGOs…</div>
        ) : ngos.length === 0 ? (
          <div className="text-gray-500">No NGOs found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ngos.slice(0, 3).map((ngo: any) => (
              <NgoCard key={ngo.id || ngo._id || ngo.name} ngo={ngo} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Reviews & Feedback</h2>
          <a href="/user/volunteer/reviews" className="text-blue-600 hover:underline text-sm font-medium">View All</a>
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
            {reviews.slice(0, 3).map((review: any) => (
              <ReviewItem key={review._id || review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
