"use client";

import React, { useEffect, useState } from "react";
import { fetchVolunteerTasks, acceptVolunteerTask, cancelVolunteerTask, completeVolunteerTask, TaskStatus } from "@/lib/actions/volunteer/task-actions";
import { useAuth } from "@/context/AuthContext";
import { DonationsApi } from "@/lib/api/donor/donations";
import { NGOsApi } from "@/lib/api/admin/ngos";
import Card from "@/app/(platform)/_components/Card";
import ConfirmDialog from "@/app/(platform)/_components/ConfirmDialog";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });
  // hook requires an argument even though it's not used here
  const { pushToast } = useToast({ title: '', tone: 'info' });
  const auth = useAuth();
  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchVolunteerTasks(statusFilter && statusFilter !== 'all' ? { status: statusFilter as TaskStatus } : undefined);
      // For each task, fetch donation and NGO details
      const tasksWithDetails = await Promise.all(
        data.map(async (task: any) => {
          let donation = null;
          let ngo = null;
          try {
            // Fix: Ensure donationId is a string/ID, not an object
            const donationId = typeof task.donationId === "object" && task.donationId?._id ? task.donationId._id : task.donationId;
            if (donationId) {
              const res = await DonationsApi.getById(donationId);
              donation = res.data;
                // Fetch NGO details using the public endpoint
                const ngoId = typeof task.ngoId === "object" && task.ngoId?._id ? task.ngoId._id : task.ngoId;
              if (ngoId) {
                const res = await NGOsApi.getById(ngoId);
                ngo = res.data;
              }
            }
          } catch (error) {
            console.error("Failed to fetch donation/NGO details:", error);
          }
          return {
            ...task,
            donation,
            ngo,
          };
        })
      );
      setTasks(tasksWithDetails);
      // Update global auth user totals so profile reflects latest task counts
      try {
        const totalTasks = tasksWithDetails.length;
        const completedTasks = tasksWithDetails.filter((t: any) => t.status === "completed").length;
        const impactPoints = completedTasks * 10; // same logic as profile
        if (auth && auth.user) {
          const merged = { ...auth.user, totalTasks, completedTasks, impactPoints };
          try { auth.setUser && auth.setUser(merged); } catch (e) {}
        }
      } catch (e) {}
    } catch (e: any) {
      setError(e.message || "Failed to load tasks");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);


  const handleAccept = async (taskId: string) => {
    setActionLoading(taskId + "-accept");
    try {
      await acceptVolunteerTask(taskId);
      await loadTasks();
      pushToast({ title: "Task accepted", tone: "success" });
    } catch (e) {
      pushToast({ title: "Failed to accept task", description: (e as any)?.message || "An error occurred.", tone: "error" });
    }
    setActionLoading(null);
  };

  const handleReject = async (taskId: string) => {
    setActionLoading(taskId + "-reject");
    try {
      await cancelVolunteerTask(taskId);
      const taskObj = tasks.find((t) => t._id === taskId);
      const donationId = taskObj?.donation?._id || taskObj?.donation || taskObj?.donationId || null;
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      // If a related donation exists, try to reset its status so it becomes assignable again
      if (donationId) {
        try {
          await DonationsApi.update(donationId, { status: 'approved', ngoId: undefined });
          pushToast({ title: "Task rejected", tone: "success" });
        } catch (err: any) {
          // If public update is not allowed, still consider task rejected but inform user
          pushToast({ title: "Task rejected", description: "Could not update donation status (permission issue)", tone: "error" });
        }
      } else {
        pushToast({ title: "Task rejected successfully", tone: "success" });
      }
    } catch (e: any) {
      pushToast({
        title: "Failed to reject task",
        description: e?.message || "An error occurred.",
        tone: "error",
      });
    }
    setActionLoading(null);
    setConfirmReject({ open: false, taskId: null });
  };

  const handleComplete = async (taskId: string) => {
    setActionLoading(taskId + "-complete");
    try {
      await completeVolunteerTask(taskId);
      await loadTasks();
      pushToast({ title: "Task completed", description: "Thank you for completing the task.", tone: "success" });
      // donation status likely flipped to 'completed' which triggers thank-you email
      pushToast({ title: "Thank-you note has been sent to donor", tone: "info" });
    } catch (e) {
      pushToast({ title: "Failed to complete task", description: (e as any)?.message || "An error occurred.", tone: "error" });
    }
    setActionLoading(null);
  };

  return (
    <div className="p-0">
      <h1 className="text-2xl font-semibold mb-4">My Tasks</h1>
      <div className="mb-4 flex items-center gap-3">
        <label className="font-medium">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {loading ? (
        <div>Loading tasks...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : tasks.length === 0 ? (
        <div>No tasks assigned.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const pickupLocation = task.donation?.pickupLocation || "-";
            const dropLocation = task.ngo?.address || "-";
            const donorContact = task.donation?.donorId && typeof task.donation.donorId === "object"
              ? `${task.donation.donorId.name || ""} (${task.donation.donorId.email || ""}, ${task.donation.donorId.phone || task.donation.donorId.phoneNumber || ""})`
              : "-";
            const ngoContact = task.ngo
              ? `${task.ngo.name || ""} (${task.ngo.email || ""}, ${task.ngo.phone || ""})`
              : "-";
            return (
              <Card key={task._id} className="flex flex-col h-full justify-between">
                <div>
                  <div className="font-bold text-lg mb-1">{task.title}</div>
                  <div className="text-sm text-gray-500 mb-1">Status: <span className="font-medium">{task.status}</span></div>
                  <div className="text-sm text-gray-700 mb-1">Pickup Location: <span className="font-medium">{pickupLocation}</span></div>
                  <div className="text-sm text-gray-700 mb-1">Drop Location: <span className="font-medium">{dropLocation}</span></div>
                  <div className="text-sm text-gray-700 mb-1">Donor Contact: <span className="font-medium">{donorContact}</span></div>
                  <div className="text-sm text-gray-700 mb-1">NGO Contact: <span className="font-medium">{ngoContact}</span></div>
                </div>
                <div className="mt-4 flex flex-row items-end gap-2 justify-end">
                  {task.status === "assigned" && (
                    <>
                      <button
                        className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold shadow-sm px-5 py-2 text-sm transition hover:bg-emerald-200 disabled:opacity-60 w-32"
                        disabled={actionLoading === task._id + "-accept"}
                        onClick={() => handleAccept(task._id)}
                      >
                        {actionLoading === task._id + "-accept" ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        className="rounded-full bg-rose-100 border border-rose-200 text-rose-800 font-semibold shadow-sm px-5 py-2 text-sm transition hover:bg-rose-200 disabled:opacity-60 w-32"
                        disabled={actionLoading === task._id + "-reject"}
                        onClick={() => setConfirmReject({ open: true, taskId: task._id })}
                      >
                        {actionLoading === task._id + "-reject" ? "Rejecting..." : "Reject"}
                      </button>
                    </>
                  )}
                  {task.status === "accepted" && (
                    <button
                      className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold shadow-sm px-5 py-2 text-sm transition hover:bg-emerald-200 disabled:opacity-60 w-40 whitespace-nowrap"
                      disabled={actionLoading === task._id + "-complete"}
                      onClick={() => handleComplete(task._id)}
                    >
                      {actionLoading === task._id + "-complete" ? "Completing..." : "Mark as Complete"}
                    </button>
                  )}
                  {task.status === "completed" && (
                    <span className="text-green-700 font-semibold">Completed</span>
                  )}
                  {task.status === "rejected" && (
                    <span className="text-red-600 font-semibold">Rejected</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {confirmReject.open && (
        <ConfirmDialog
          open={confirmReject.open}
          title="Reject Task"
          description="Are you sure you want to reject this task? This action cannot be undone."
          onCancel={() => setConfirmReject({ open: false, taskId: null })}
          onConfirm={async () => {
            if (confirmReject.taskId) await handleReject(confirmReject.taskId);
          }}
          confirmLabel="Reject"
          cancelLabel="Cancel"
          loading={!!(actionLoading && confirmReject.taskId && actionLoading === confirmReject.taskId + "-reject")}
        />
      )}
    </div>
  );
}