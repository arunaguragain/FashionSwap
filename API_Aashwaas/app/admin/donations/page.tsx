"use client";

import { useEffect, useState } from "react";
import { AdminDonationsApi } from "@/lib/api/admin/donations";
import DonationsTable from "./_components/DonationsTable";
const donationCategories = [
  'Clothes', 'Books', 'Electronics', 'Furniture', 'Food', 'Other'
];

export default function AdminDonationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");

  const load = () => {
    setLoading(true);
    setError(null);
    AdminDonationsApi.list()
      .then((res: { data: any[] }) => {
        setItems(res.data);
      })
      .catch(() => {
        setError("Unable to load donations.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Only rely on ConfirmDialog in DonationsTable for delete confirmation
  const handleDelete = async (id: string) => {
    try {
      await AdminDonationsApi.remove(id);
      setItems((prev) => prev.filter((i) => (i.id || i._id) !== id));
    } catch (e) {
      setError("Unable to delete donation right now.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Donation Management</h1>
          <p className="text-sm text-gray-500">Review and manage donor-submitted donations</p>
        </div>
        <div className="flex items-center gap-3 ml-auto mt-2 sm:mt-0">
          <input
            aria-label="Search donations"
            placeholder="Search donations by title, donor, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72 rounded-md border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            aria-label="Filter by category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="rounded-md border border-gray-400 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Types</option>
            {donationCategories.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>
      )}

      <DonationsTable
        initialDonations={items}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={load}
        query={query}
        category={category}
      />
    </div>
  );
}
