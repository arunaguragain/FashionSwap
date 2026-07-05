import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DonationsOverTimeChartProps {
  data: { name: string; Donations: number }[];
  loading: boolean;
}

const DonationsOverTimeChart: React.FC<DonationsOverTimeChartProps> = ({ data, loading }) => (
  <div className="h-64">
    {loading ? (
      <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default DonationsOverTimeChart;
