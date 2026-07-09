"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DonationsOverTimeChartProps {
  data: Array<{ name: string; Donations: number }>;
  loading?: boolean;
}

export default function DonationsOverTimeChart({ data, loading }: DonationsOverTimeChartProps) {
  if (loading || !data?.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-gray-500">No trend data yet.</div>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="Donations" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.25} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
