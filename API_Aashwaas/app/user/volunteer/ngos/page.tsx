"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import NgoCard from "../../../(platform)/_components/NgoCard";

export default function Page() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusFilter, setFocusFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    const fetchNgos = async () => {
      try {
        const res = await axios.get(API.NGO.LIST);
        const payload = res?.data;
        const data = Array.isArray(payload) ? payload : payload?.data ?? [];
        if (mounted) setNgos(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load NGOs", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchNgos();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">NGO Directory</h1>
          <p className="text-sm text-gray-500">Browse NGOs registered on the platform</p>
        </div>
        <div className="ml-4">
          <label className="sr-only">Filter by focus area</label>
          <select
            value={focusFilter}
            onChange={(e) => setFocusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Focus Areas</option>
            {Array.from(new Set(ngos.flatMap((n) => n?.focusAreas || []))).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading NGOs...</div>
      ) : ngos.length === 0 ? (
        <div className="text-gray-500">No NGOs found.</div>
      ) : (
        (() => {
          const filtered =
            focusFilter === "all"
              ? ngos
              : ngos.filter((ngo) => (ngo?.focusAreas || []).includes(focusFilter));
          if (filtered.length === 0) {
            return <div className="text-gray-500">No NGOs match the selected focus area.</div>;
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ngo: any) => (
                <NgoCard key={ngo.id || ngo._id || ngo.name} ngo={ngo} />
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
}
