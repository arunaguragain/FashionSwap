import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4f46e5", "#22d3ee", "#f59e42", "#f43f5e", "#10b981", "#6366f1", "#fbbf24", "#a21caf"];

interface CategoryPieChartProps {
  data: { name: string; value: number }[];
  loading: boolean;
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, loading }) => (
  <div className="h-64 flex items-center justify-center">
    {loading ? (
      <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
    ) : data.length === 0 ? (
      <div className="text-gray-400">No data</div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default CategoryPieChart;
