import type { ReactNode } from "react";

const toneStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-sky-100 text-sky-800 border-sky-200",
  assigned: "bg-indigo-100 text-indigo-800 border-indigo-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  gold: "bg-amber-100 text-amber-900 border-amber-300",
  silver: "bg-slate-100 text-slate-800 border-slate-200",
  bronze: "bg-orange-100 text-orange-800 border-orange-200",
  verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  success: "bg-green-100 text-green-800 border-green-200",
};

export default function Badge({
  label,
  tone,
  icon,
}: {
  label: string;
  tone: string;
  icon?: ReactNode;
}) {
  const classes = toneStyles[tone] ?? "bg-slate-100 text-slate-800 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      {icon}
      {label}
    </span>
  );
}
