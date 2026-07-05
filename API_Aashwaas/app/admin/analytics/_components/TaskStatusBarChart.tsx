import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface TaskStatusBarChartProps {
  data: { name: string; value: number }[];
  loading: boolean;
}

const TaskStatusBarChart: React.FC<TaskStatusBarChartProps> = ({ data, loading }) => (
  <div className="h-64 flex items-center justify-center">
    {loading ? (
      <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
          <YAxis tick={{ fill: '#64748b' }} />
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf6" />
          <Tooltip />
          <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default TaskStatusBarChart;
