"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NgoType } from "@/app/admin/ngos/schemas";
import { AdminNGOsApi } from "@/lib/api/admin/ngos";
import NgoTable from "./_components/NgoTable";
type NGO = NgoType & { id: string; createdAt?: string; updatedAt?: string; image?: string };

export default function AdminNGOPage() {
  const [items, setItems] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "mock">("api");

  // UI state
  const [perPage, setPerPage] = useState(10);
  const [focusFilter, setFocusFilter] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const load = () => {
    setLoading(true);
    setError(null);
    AdminNGOsApi.adminList()
      .then((result) => {
        setItems(result.data);
        setSource(result.source);
      })
      .catch(() => {
        setError("Unable to load NGOs.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Only rely on custom confirmation in NgoTable for delete confirmation
  const handleDelete = async (id: string) => {
    try {
      await AdminNGOsApi.adminRemove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setError("Unable to delete NGO right now.");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      // text match
      const matchesText = !q || i.name.toLowerCase().includes(q) || (i.email || "").toLowerCase().includes(q) || (i.contactPerson || "").toLowerCase().includes(q);

      // normalize focus areas to an array of strings
      const areas: string[] = Array.isArray(i.focusAreas)
        ? i.focusAreas
        : typeof i.focusAreas === "string"
        ? (i.focusAreas as string).split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const matchesFocus = !focusFilter || areas.includes(focusFilter);
      return matchesText && matchesFocus;
    });
  }, [items, query, focusFilter]);

  // Note: table component derives filtering UI and state itself

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">NGO Management</h1>
          <p className="text-sm text-gray-500">Create, review, and maintain NGO profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <div id="ngos-filters-host" className="flex items-center" />
          <Link
            href="/admin/ngos/create"
            className="inline-flex items-center rounded-lg bg-blue-600 border border-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
          >
            Add NGO
          </Link>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {/* filters are rendered into the header host by the table component */}

      <NgoTable initialNgos={items} loading={loading} onDelete={handleDelete} />
    </div>
  );
}
