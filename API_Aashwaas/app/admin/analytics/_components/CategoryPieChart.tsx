"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryPieChartProps {
  data: Array<{ name: string; value: number }>;
  loading?: boolean;
}

export default function CategoryPieChart({ data, loading }: CategoryPieChartProps) {
  if (loading || !data?.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-gray-500">No category data yet.</div>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={["#4f46e5", "#22d3ee", "#f59e42", "#10b981", "#f43f5e"][index % 5]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
