"use client"
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Users, Package, TrendingUp } from "lucide-react";
import { DonationsApi } from "@/lib/api/donor/donations";
import { TasksApi } from "@/lib/api/admin/tasks";
import { getUsers } from "@/lib/api/admin/user";
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Brush, PieChart, Pie, Cell, BarChart, Bar, LabelList, } from "recharts";
import { NGOsApi } from "@/lib/api/admin/ngos";

export default function AdminDashboard() {
  const [rawDonations, setRawDonations] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(30); // days
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);
  const [stats, setStats] = useState<{
    users: number;
    volunteers?: number;
    donations: number;
    totalAmount?: number;
    growth: number;
    pending: number;
    chartData: { name: string; Donations: number }[];
    recent?: { name: string; time: string; email?: string; category?: string; amount: number; address?: string }[];
    regions?: { name: string; value: number }[];
  }>({
    users: 0,
    donations: 0,
    totalAmount: 0,
    growth: 0,
    pending: 0,
    volunteers: 0,
    chartData: [],
    recent: [],
    regions: [],
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const donationsRes = await DonationsApi.list();
        const donationsArray = Array.isArray(donationsRes?.data) ? donationsRes.data : null;
        setApiError(!donationsArray);
        if (!donationsArray) {
          setRawDonations([]);
          setStats((s) => ({ ...s, chartData: [], recent: [], regions: [], donations: 0, totalAmount: 0 }));
          return;
        }

        const tasksRes = await TasksApi.list();

        let usersRes: any = [];
        try {
          usersRes = await getUsers();
        } catch (e) {
          usersRes = [];
        }
        const usersList = Array.isArray(usersRes) ? usersRes : usersRes?.data ?? [];

        const ngosRes = await NGOsApi?.list ? await NGOsApi.list() : { data: [] };

        const totalQuantity = donationsArray.reduce((sum: number, d: any) => sum + (Number(d.quantity) || 0), 0);
        const regionsMap: Record<string, number> = {};
        donationsArray.forEach((d: any) => {
          const region = d.city || d.region || "Unknown";
          regionsMap[region] = (regionsMap[region] || 0) + (Number(d.quantity) || 0);
        });
        const regions = Object.keys(regionsMap).slice(0, 8).map((k) => ({ name: k, value: regionsMap[k] }));

        setRawDonations(donationsArray);

        setStats({
          users: usersList.length,
          donations: donationsArray.length,
          totalAmount: totalQuantity,
          growth: Math.round((donationsArray.length / Math.max(1, usersList.length || ngosRes.data.length)) * 10),
          pending: (tasksRes?.data || []).filter((t: any) => t.status === "pending").length,
          chartData: donationsArray.slice(0, 12).map((d: any, i: number) => ({
            name: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : `Day ${i + 1}`,
            Donations: Number(d.quantity) || 1,
          })),
          recent: donationsArray.slice(0, 6).map((d: any) => ({
            name: (function () {
              try {
                const donor = d.donorName ?? d.donorId ?? d.donor;
                if (!donor) return "Unknown";
                if (typeof donor === "string") return donor;
                return donor.name || donor.email || donor._id || "Unknown";
              } catch (e) {
                return "Unknown";
              }
            })(),
            time: d.createdAt ? new Date(d.createdAt).toLocaleString() : "Just now",
            email: undefined,
            category: d.category || d.ngoName || d.title || d.itemName || "General",
            amount: Number(d.quantity) || 0,
            address: d.pickupLocation || d.city || "-",
          })),
          volunteers: (usersList || []).filter((u: any) => (u.role || "").toLowerCase() === "volunteer").length,
          regions,
        });
      } catch (err) {
        setApiError(true);
        setRawDonations([]);
        setStats((s) => ({ ...s, chartData: [], recent: [], regions: [], donations: 0, totalAmount: 0 }));
      }
    }
    fetchStats();
  }, []);

  // Helper to build chart data for the last `days` days
  const buildChartData = useCallback((donations: any[], days: number) => {
    const out: { name: string; Donations: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString();
        const sum = donations.reduce((s: number, it: any) => {
        if (!it.createdAt) return s;
        const dt = new Date(it.createdAt).toLocaleDateString();
        if (dt === key) return s + (Number(it.quantity) || 0);
        return s;
      }, 0);
      out.push({ name: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }), Donations: sum });
    }
    return out;
  }, []);

  const filteredDonations = useMemo(() => {
    if (!rawDonations || rawDonations.length === 0) return [];
    return rawDonations.filter((d: any) => {
      const regionMatches = selectedRegion ? (d.city || d.region || 'Unknown') === selectedRegion : true;
      const category = d.category || d.ngoName || d.title || d.itemName || 'Other';
      const categoryMatches = selectedCategory ? category === selectedCategory : true;
      return regionMatches && categoryMatches;
    });
  }, [rawDonations, selectedRegion, selectedCategory]);

  const chartData = useMemo(() => buildChartData(filteredDonations, timeRange), [filteredDonations, timeRange, buildChartData]);

  const topRegions = useMemo(() => {
    const map: Record<string, number> = {};
    (filteredDonations || []).forEach((d: any) => {
      const r = d.city || d.region || 'Unknown';
      map[r] = (map[r] || 0) + (Number(d.quantity) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [filteredDonations]);

  const topItems = useMemo(() => {
    const map: Record<string, number> = {};
    (filteredDonations || []).forEach((d: any) => {
      const key = d.category || d.itemName || d.title || d.ngoName || 'Other';
      map[key] = (map[key] || 0) + (Number(d.quantity) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [filteredDonations]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    (filteredDonations || []).forEach((d: any) => {
      const key = d.category || d.ngoName || d.title || d.itemName || 'General';
      map[key] = (map[key] || 0) + (Number(d.quantity) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [filteredDonations]);

  const topCategory = (categoryData && categoryData.length) ? categoryData[0] : null;

  // pie data fallback computed once to avoid duplicating long ternaries
  const pieData = (categoryData && categoryData.length)
    ? categoryData
    : (topRegions && topRegions.length)
      ? topRegions
      : (stats.regions && stats.regions.length)
        ? stats.regions
        : [{ name: 'Active', value: 40 }, { name: 'Unreach', value: 32 }, { name: 'Unactive', value: 28 }];
  // consistent palette for pie slices
  const PIE_COLORS = [
    '#1E3A8A', // blue-900
    '#7C3AED', // violet-600
    '#06B6D4', // cyan-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
  ];

  const [activeSlice, setActiveSlice] = useState<number | null>(null);

  return (
    <div className="w-full px-0 py-0">
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-0 text-zinc-500">Welcome! Here's a quick overview of your system.</p>
      {apiError ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">
          Live API unreachable — showing no live data. Start the backend or check network.
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-zinc-500">Users</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.users}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-sm text-zinc-500">Donations</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.donations}</p>
          <p className="mt-1 text-sm text-zinc-500">Items: {new Intl.NumberFormat().format(stats.totalAmount || 0)}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-zinc-500">Growth</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">+{stats.growth}%</p>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-teal-600" />
            <span className="text-sm text-zinc-500">Volunteers</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.volunteers ?? 0}</p>
          <p className="mt-0.5 text-sm text-zinc-500">active volunteers</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-3 shadow-sm h-full lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Donations Overview</h2>
            <div className="flex items-center gap-3">
              {(selectedRegion || selectedCategory) ? (
                <div className="flex items-center gap-3">
                  {selectedRegion ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-600">Region:</span>
                      <button onClick={() => setSelectedRegion(null)} className="text-sm text-blue-600 underline">Clear</button>
                    </div>
                  ) : null}
                  {selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-600">Category:</span>
                      <button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 underline">Clear</button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))} className="text-sm rounded border px-2 py-1">
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#e6edf6" />
              <Tooltip formatter={(value: any) => [value, 'Items']} />
              <Area type="monotone" dataKey="Donations" stroke="#4f46e5" strokeWidth={2} fill="url(#colorDonations)" animationDuration={800} />
              <Brush dataKey="name" height={24} stroke="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm min-h-[420px] flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Donation Breakdown</h3>
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[360px]">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%"
                      outerRadius={92} innerRadius={44} paddingAngle={6}
                      onClick={(entry) => {
                        try {
                          const name = (entry && (entry as any).name) || null;
                          if (name) setSelectedCategory(name);
                        } catch (e) {}
                      }}
                      onMouseEnter={(_data, index) => setActiveSlice(index)}
                      onMouseLeave={() => setActiveSlice(null)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke={(selectedCategory === entry.name) || activeSlice === index ? '#0f172a' : undefined}
                          strokeWidth={(selectedCategory === entry.name) || activeSlice === index ? 2 : 0}
                          style={{ transition: 'stroke-width 150ms' }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full flex justify-center mt-0">
              <div className="w-full max-w-[480px] grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
                {pieData.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span style={{ width: 14, height: 14, background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block', borderRadius: 4 }} />
                    <span className="text-sm text-zinc-700 text-center break-words max-w-[160px]">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full mt-4 text-center">
              <p className="text-sm text-zinc-700">
                <strong className="text-zinc-900">Top:</strong> {topCategory ? `${topCategory.name} — ${topCategory.value} items` : '—'}
                <span className="mx-2">•</span>
                <strong className="text-zinc-900">Total:</strong> {stats.totalAmount || 0} items
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-3 shadow-sm lg:col-span-2 max-h-[300px] overflow-auto">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Recent Donations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-zinc-500">
                  <th className="pb-3">Donor</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recent || []).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 text-sm text-zinc-900">{r.name}</td>
                    <td className="py-1 text-xs text-zinc-500">{r.time}</td>
                    <td className="py-1 text-xs text-zinc-500">{r.category}</td>
                    <td className="py-1 text-xs text-zinc-500">{r.address}</td>
                    <td className="py-1 text-right font-medium text-zinc-900">{new Intl.NumberFormat().format(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-3 shadow-sm max-h-[300px] overflow-auto">
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Top Donation Items</h3>
          <div className="space-y-0">
            <div>
              <h4 className="text-sm text-zinc-600 mb-2">Top Items (bar)</h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={topItems} layout="vertical" margin={{ left: -8, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(t: string) => (t && t.length > 26 ? t.slice(0, 24) + '...' : t)}
                  />
                  <Tooltip formatter={(v: any) => [v, 'Quantity']} />
                  <Bar dataKey="value" fill="#4f46e5" animationDuration={700} radius={[6, 6, 6, 6]} barSize={14}>
                    <LabelList dataKey="value" position="right" formatter={(v: any) => v} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
