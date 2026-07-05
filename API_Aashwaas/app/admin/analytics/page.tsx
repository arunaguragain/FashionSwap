
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { AdminDonationsApi } from "@/lib/api/admin/donations";
import { AdminNGOsApi } from "@/lib/api/admin/ngos";
import { getUsers } from "@/lib/api/admin/user";
import { TasksApi } from "@/lib/api/admin/tasks";
import DonationsOverTimeChart from "./_components/DonationsOverTimeChart";
import CategoryPieChart from "./_components/CategoryPieChart";
import TaskStatusBarChart from "./_components/TaskStatusBarChart";
import KeyMetricCard from "./_components/KeyMetricCard";
import { FaGift, FaUsers, FaTasks, FaBuilding } from "react-icons/fa";

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    donations: 0,
    ngos: 0,
    users: 0,
    tasks: 0,
    donationsPrev: 0,
    ngosPrev: 0,
    usersPrev: 0,
    tasksPrev: 0,
  });
  const [donationTrends, setDonationTrends] = useState<{ name: string; Donations: number }[]>([]);
  const [topDonors, setTopDonors] = useState<{ name: string; value: number }[]>([]);
  // Removed topNgos
  const [recent, setRecent] = useState<any[]>([]);
  const [mostActiveVolunteer, setMostActiveVolunteer] = useState<{ name: string; count: number } | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [recentNgos, setRecentNgos] = useState<any[]>([]);
  const [mostDonatedItem, setMostDonatedItem] = useState<[string, number] | null>(null);
  const [avgDonationPerUser, setAvgDonationPerUser] = useState<string>("0");
  const [taskCompletionRate, setTaskCompletionRate] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [donRes, ngoRes, userResRaw, taskRes] = await Promise.all([
          AdminDonationsApi.list(),
          AdminNGOsApi.adminList(),
          getUsers(),
          TasksApi.list(),
        ]);
        const donations = donRes.data || [];
        const ngos = ngoRes.data || [];
        // Explicitly type userResRaw as any to avoid 'never' type error
        const userRes: any = userResRaw;
        const users = Array.isArray(userRes) ? userRes : userRes?.data ?? [];
        const tasks = taskRes.data || [];

        // Calculate previous 7 days for growth
        const now = new Date();
        const getCount = (arr: any[], daysAgoStart: number, daysAgoEnd: number, dateField = 'createdAt') => {
          const start = new Date(now);
          start.setDate(now.getDate() - daysAgoStart);
          const end = new Date(now);
          end.setDate(now.getDate() - daysAgoEnd);
          return arr.filter((x) => {
            const dt = x[dateField] ? new Date(x[dateField]) : null;
            return dt && dt >= end && dt < start;
          }).length;
        };
        setMetrics({
          donations: donations.length,
          ngos: ngos.length,
          users: users.length,
          tasks: tasks.length,
          donationsPrev: getCount(donations, 14, 7),
          ngosPrev: getCount(ngos, 14, 7),
          usersPrev: getCount(users, 14, 7),
          tasksPrev: getCount(tasks, 14, 7),
        });

        // Trends: last 14 days
        const days = 14;
        const trends: { name: string; Donations: number }[] = [];
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
          trends.push({ name: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }), Donations: sum });
        }
        setDonationTrends(trends);

        // Top Donors
        const donorMap: Record<string, number> = {};
        donations.forEach((d: any) => {
          const donor = d.donorName || d.donorId || d.donor || "Unknown";
          const name = typeof donor === "string" ? donor : donor?.name || donor?.email || donor?._id || "Unknown";
          donorMap[name] = (donorMap[name] || 0) + (Number(d.quantity) || 0);
        });
        setTopDonors(Object.entries(donorMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })));


        // Most Donated Item
        const itemMap: Record<string, number> = {};
        donations.forEach((d: any) => {
          const item = d.itemName || d.title || "Unknown";
          itemMap[item] = (itemMap[item] || 0) + (Number(d.quantity) || 0);
        });
        const mostDonatedItem = Object.entries(itemMap).sort((a, b) => b[1] - a[1])[0] || null;
        setMostDonatedItem(mostDonatedItem);

        // Average Donation per User
        const avgDonationPerUser = users.length > 0 ? (donations.length / users.length).toFixed(2) : "0";
        setAvgDonationPerUser(avgDonationPerUser);

        // Task Completion Rate
        const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
        const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        setTaskCompletionRate(taskCompletionRate);

        // Most Active Volunteer (show name, not id)
        const volunteerMap: Record<string, number> = {};
        const volunteerIdToName: Record<string, string> = {};
        users.forEach((u: any) => {
          if ((u.role || '').toLowerCase() === 'volunteer') {
            volunteerIdToName[u._id || u.id] = u.name || u.fullName || u.email || u.username || u._id || u.id;
          }
        });
        tasks.forEach((t: any) => {
          let vId = t.assignedTo || t.volunteerId;
          let vName = t.volunteerName;
          let name = "Unknown";
          if (vName && typeof vName === 'string') {
            name = vName;
          } else if (vId && typeof vId === 'string' && volunteerIdToName[vId]) {
            name = volunteerIdToName[vId];
          } else if (vId && typeof vId === 'object' && (vId._id || vId.id) && volunteerIdToName[vId._id || vId.id]) {
            name = volunteerIdToName[vId._id || vId.id];
          }
          volunteerMap[name] = (volunteerMap[name] || 0) + 1;
        });
        const volunteerArr = Object.entries(volunteerMap).sort((a, b) => b[1] - a[1]);
        setMostActiveVolunteer(volunteerArr.length ? { name: volunteerArr[0][0], count: volunteerArr[0][1] } : null);

        // Donation Category Breakdown
        const catMap: Record<string, number> = {};
        donations.forEach((d: any) => {
          const cat = d.category || "Other";
          catMap[cat] = (catMap[cat] || 0) + (Number(d.quantity) || 0);
        });
        setCategoryBreakdown(Object.entries(catMap).map(([name, value]) => ({ name, value })));        

        // Recent NGO Signups
        setRecentNgos(
          ngos
            .slice()
            .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 5)
        );

        // Recent Activity
        setRecent(donations.slice(0, 4).map((d: any) => ({
          donor: (function () {
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
          item: d.title || d.itemName || "-",
          ngo: d.ngoName || (typeof d.ngoId === "string" ? d.ngoId : d.ngoId?.name) || "-",
          quantity: d.quantity || 1,
        })));
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    fetchData();
  }, []);


  // Helper for growth percentage
  const getGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  // Color palette for charts
  const COLORS = ["#4f46e5", "#22d3ee", "#f59e42", "#f43f5e", "#10b981", "#6366f1", "#fbbf24", "#a21caf"];

  return (
    <div className="space-y-10 max-w-12xl mx-auto p-2 md:p-2  min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
      </div>

      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="rounded-xl bg-white shadow border border-gray-100 p-4 flex flex-col items-start min-h-[80px] justify-center">
          <div className="flex items-center gap-2">
            <FaGift className="text-green-500 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? '--' : metrics.donations}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Total Donations</div>
          <div className="text-xs mt-1 flex items-center gap-1">
            <span className={
              getGrowth(metrics.donations, metrics.donationsPrev) > 0
                ? 'text-green-600'
                : getGrowth(metrics.donations, metrics.donationsPrev) < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }>
              {getGrowth(metrics.donations, metrics.donationsPrev) > 0
                ? '▲'
                : getGrowth(metrics.donations, metrics.donationsPrev) < 0
                ? '▼'
                : ''}
              {getGrowth(metrics.donations, metrics.donationsPrev)}%
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-100 p-6 flex flex-col items-start min-h-[110px]">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-cyan-500 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? '--' : metrics.ngos}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Active NGOs</div>
          <div className="text-xs mt-1 flex items-center gap-1">
            <span className={
              getGrowth(metrics.ngos, metrics.ngosPrev) > 0
                ? 'text-green-600'
                : getGrowth(metrics.ngos, metrics.ngosPrev) < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }>
              {getGrowth(metrics.ngos, metrics.ngosPrev) > 0
                ? '▲'
                : getGrowth(metrics.ngos, metrics.ngosPrev) < 0
                ? '▼'
                : ''}
              {getGrowth(metrics.ngos, metrics.ngosPrev)}%
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-100 p-6 flex flex-col items-start min-h-[110px]">
          <div className="flex items-center gap-2">
            <FaUsers className="text-orange-400 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? '--' : metrics.users}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Registered Users</div>
          <div className="text-xs mt-1 flex items-center gap-1">
            <span className={
              getGrowth(metrics.users, metrics.usersPrev) > 0
                ? 'text-green-600'
                : getGrowth(metrics.users, metrics.usersPrev) < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }>
              {getGrowth(metrics.users, metrics.usersPrev) > 0
                ? '▲'
                : getGrowth(metrics.users, metrics.usersPrev) < 0
                ? '▼'
                : ''}
              {getGrowth(metrics.users, metrics.usersPrev)}%
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow border border-gray-100 p-6 flex flex-col items-start min-h-[110px]">
          <div className="flex items-center gap-2">
            <FaTasks className="text-purple-500 text-xl" />
            <span className="text-2xl font-semibold text-gray-900">{loading ? '--' : metrics.tasks}</span>
          </div>
          <div className="text-sm text-gray-700 mt-1 font-medium">Tasks Created</div>
          <div className="text-xs mt-1 flex items-center gap-1">
            <span className={
              getGrowth(metrics.tasks, metrics.tasksPrev) > 0
                ? 'text-green-600'
                : getGrowth(metrics.tasks, metrics.tasksPrev) < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }>
              {getGrowth(metrics.tasks, metrics.tasksPrev) > 0
                ? '▲'
                : getGrowth(metrics.tasks, metrics.tasksPrev) < 0
                ? '▼'
                : ''}
              {getGrowth(metrics.tasks, metrics.tasksPrev)}%
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards and Charts Section: single grid for all */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col min-h-[70px] justify-center">
          <div className="text-xs text-gray-700 mb-1">Most Donated Item</div>
          <div className="text-base font-semibold text-gray-900">{loading ? "--" : mostDonatedItem ? `${mostDonatedItem[0]} (${mostDonatedItem[1]})` : "No data"}</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col min-h-[70px] justify-center">
          <div className="text-xs text-gray-700 mb-1">Most Active Volunteer</div>
          {loading ? <div className="text-gray-400">Loading...</div> : mostActiveVolunteer ? (
            <div className="flex justify-between text-base">
              <span className="text-gray-800 font-medium">{mostActiveVolunteer.name}</span>
              <span className="font-semibold text-gray-500">{mostActiveVolunteer.count} tasks</span>
            </div>
          ) : <div className="text-gray-400">No data</div>}
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col min-h-[70px] justify-center">
          <div className="text-xs text-gray-700 mb-1">Avg. Donation per User</div>
          <div className="text-base font-semibold text-gray-900">{loading ? "--" : avgDonationPerUser}</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col min-h-[70px] justify-center">
          <div className="text-xs text-gray-700 mb-1">Task Completion Rate</div>
          <div className="text-base font-semibold text-gray-900">{loading ? "--" : `${taskCompletionRate}%`}</div>
        </div>
      </div>

      {/* Trends, Category Breakdown, and New Diagrams */}
      {/* Charts Section: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area Chart: Donations Over Time */}
        <div className="rounded-lg bg-white border border-gray-100 shadow-sm p-5">
          <div className="text-lg font-semibold mb-2 text-gray-900">Donations Over Time</div>
          <DonationsOverTimeChart data={donationTrends} loading={loading} />
        </div>

        {/* Pie Chart: Donation Category Breakdown */}
        <div className="rounded-lg bg-white border border-gray-100 shadow-sm p-5">
          <div className="text-lg font-semibold mb-2 text-gray-900">Donation Category Breakdown</div>
          <CategoryPieChart data={categoryBreakdown} loading={loading} />
        </div>

        {/* Bar Chart: Task Completion by Status */}
        <div className="rounded-lg bg-white border border-gray-100 shadow-sm p-5">
          <div className="text-lg font-semibold mb-2 text-gray-900">Task Status Breakdown</div>
          <TaskStatusBarChart
            data={useMemo(() => [
              { name: 'Completed', value: taskCompletionRate },
              { name: 'Pending', value: metrics.tasks - taskCompletionRate },
            ], [metrics.tasks, taskCompletionRate])}
            loading={loading}
          />
        </div>
      </div>

      {/* Recent NGO Signups, Top Donors, and Recent Activity in a single row */}
      <div className="flex flex-col lg:flex-row gap-6 mb-2">
        {/* Recent NGO Signups */}
        <div className="basis-1/3 lg:basis-1/3 rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col min-h-[70px] justify-center">
          <div className="text-xs text-gray-700 mb-1">Recent NGO Signups</div>
          {loading ? <div className="text-gray-400">Loading...</div> : (
            <ul className="space-y-1">
              {recentNgos.map((ngo, i) => (
                <li key={i} className="flex justify-between text-base">
                  <span className="text-gray-800 font-medium">{ngo.name}</span>
                  <span className="text-xs text-gray-400">{ngo.createdAt ? new Date(ngo.createdAt).toLocaleDateString() : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Top Donors */}
        <div className="basis-1/5 lg:basis-1/5 rounded-lg bg-white border border-gray-100 shadow-sm p-5 flex flex-col min-h-[70px] justify-center">
          <div className="text-lg font-semibold mb-2 text-gray-900">Top Donors</div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {topDonors.map((d, i) => (
                <li key={i} className="flex justify-between text-base">
                  <span>{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Recent Activity */}
        <div className="basis-2/5 lg:basis-2/5 rounded-lg bg-white border border-gray-100 shadow-sm p-5 flex flex-col min-h-[70px] justify-center">
          <div className="text-lg font-semibold mb-2 text-gray-900">Recent Activity</div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-500">
                    <th className="pb-2">Donor</th>
                    <th className="pb-2">Date & Time</th>
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-indigo-50 transition-colors">
                      <td className="py-1 text-base text-zinc-900">{r.donor}</td>
                      <td className="py-1 text-xs text-zinc-500">{r.time}</td>
                      <td className="py-1 text-xs text-zinc-500">{r.item}</td>
                      <td className="py-1 text-right font-medium text-zinc-900">{r.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
