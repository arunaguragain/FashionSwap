import React from "react";
import { IconType } from "react-icons";

interface KeyMetricCardProps {
  label: string;
  value: number | string;
  growth: number;
  icon: React.ReactNode;
  loading?: boolean;
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ label, value, growth, icon, loading }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-2 hover:shadow-xl transition-shadow duration-200 border border-zinc-100">
      <div className="flex justify-between items-center text-gray-500 mb-1">
        <span className="text-2xl text-indigo-600">{icon}</span>
        <span className={`ml-2 text-xs font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{growth}%</span>
      </div>
      <div className="text-base font-medium text-zinc-500">{label}</div>
      <div className="text-3xl font-bold text-zinc-900">{loading ? "--" : value}</div>
    </div>
  );
};

export default KeyMetricCard;
