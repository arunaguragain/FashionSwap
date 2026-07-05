import React, { useState } from "react";
import Badge from "@/app/(platform)/_components/Badge";
import Link from "next/link";
import ConfirmDialog from "@/app/(platform)/_components/ConfirmDialog";
import { TasksApi } from "@/lib/api/admin/tasks";
import { AdminDonationsApi } from "@/lib/api/admin/donations";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

type Task = {
  id?: string;
  _id?: string;
  title?: string;
  donationId?: string;
  status: string;
  pickupLocation?: string;
  dropLocation?: string;
  donorContact?: string;
  ngoContact?: string;
  assignedAt?: string | Date;
  volunteer?: any;
  assignedTo?: string | { name?: string; email?: string; phone?: string };
};

interface TaskTableProps {
  tasks: Task[];
}

export default function TaskTable({ tasks: initialTasks }: TaskTableProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { pushToast } = useToast();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const taskToDelete = tasks.find((t) => (t.id || t._id) === id);
    const donationId = taskToDelete?.donationId || null;
    try {
      await TasksApi.delete?.(id); 
      setTasks((prev) => prev.filter((task) => (task.id || task._id) !== id));
      if (donationId) {
        try {
          await AdminDonationsApi.update(donationId, { status: 'approved', ngoId: undefined });
          pushToast({ title: 'Related donation reset', description: 'Donation status set to approved', tone: 'success' });
        } catch (err: any) {
          pushToast({ title: 'Failed to update donation', description: err?.message || '', tone: 'error' });
        }
      }
    } catch (err) {
    }
    setDeletingId(null);
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-2">
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Confirm delete"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId ? handleDelete(pendingDeleteId) : undefined}
        loading={!!(pendingDeleteId && deletingId === pendingDeleteId)}
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
        <div>
          <table className="w-full">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-800">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pickup Location</th>
                <th className="px-4 py-3">Drop Location</th>
                <th className="px-4 py-3">Donor Contact</th>
                <th className="px-4 py-3">NGO Contact</th>
                <th className="px-4 py-3">Volunteer</th>
                <th className="px-4 py-3">Assigned At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {tasks.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-600" colSpan={10}>No tasks found.</td>
                </tr>
              ) : (
                tasks.map((task, idx) => (
                  <tr key={task.id || task._id || idx} className="text-sm text-gray-800 hover:bg-gray-100">
                    <td className="px-4 py-4">{idx + 1}</td>
                    <td className="px-4 py-4 font-medium text-gray-900">{task.title || '-'}</td>
                    <td className="px-4 py-4"><Badge label={task.status} tone={task.status} /></td>
                    <td className="px-4 py-4">{task.pickupLocation || "-"}</td>
                    <td className="px-4 py-4">{task.dropLocation || "-"}</td>
                    <td className="px-4 py-4">{task.donorContact || "-"}</td>
                    <td className="px-4 py-4">{task.ngoContact || "-"}</td>
                    <td className="px-4 py-4">{task.volunteer || "-"}</td>
                    <td className="px-4 py-4">{task.assignedAt ? new Date(task.assignedAt).toLocaleString() : ""}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-nowrap items-center gap-1">
                        <Link href={`/admin/tasks/${task.id || task._id}`} className="inline-flex items-center justify-center rounded-full bg-amber-100 border border-amber-200 text-amber-800 hover:bg-amber-200 shadow-sm px-2 py-1 text-xs font-medium" title="View">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link href={`/admin/tasks/${task.id || task._id}/edit`} className="inline-flex items-center justify-center rounded-full bg-sky-100 border border-sky-200 text-sky-800 hover:bg-sky-200 shadow-sm px-2 py-1 text-xs font-medium" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7l-1.5-1.5" />
                          </svg>
                        </Link>
                        <button type="button" onClick={() => setPendingDeleteId((task.id || task._id) ?? null)} className={`inline-flex items-center justify-center rounded-full bg-rose-100 border border-rose-200 text-rose-800 hover:bg-rose-200 shadow-sm px-2 py-1 text-xs font-medium ${deletingId === (task.id || task._id) ? 'opacity-60 pointer-events-none' : ''}`} title="Delete">
                          {deletingId === (task.id || task._id) ? (
                            <svg className="h-4 w-4 animate-spin text-rose-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" /><path d="M22 12a10 10 0 00-10-10" strokeWidth="3" stroke="currentColor" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3h4l1 4H9l1-4z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
