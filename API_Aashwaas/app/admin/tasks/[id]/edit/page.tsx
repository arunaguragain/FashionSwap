"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { fetchAdminTaskById, updateAdminTask, updateAdminTaskStatus } from "@/lib/actions/admin/task-actions";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import type { TaskStatus } from "@/lib/api/admin/tasks";

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus | "">("");
  // supply dummy placeholder (not actually used)
  const { pushToast } = useToast({ title: '', tone: 'info' });

  useEffect(() => {
    async function fetchDetails() {
      try {
        const apiResponse = await import("@/lib/api/admin/tasks").then(m => m.TasksApi.getById(id));
        const data = apiResponse?.data;

        // Use type assertions to access extra fields
        const extra = data as any;
        let donationId = '';
        let ngoId = '';
        let volunteerId = '';
        let pickupLocation = '';
        let dropLocation = '';
        let volunteerName = '';
        let volunteerIdForState = '';
        if (extra?.donationId) {
          donationId = typeof extra.donationId === 'object' ? extra.donationId._id : extra.donationId;
        }
        if (extra?.ngoId) {
          ngoId = typeof extra.ngoId === 'object' ? extra.ngoId._id : extra.ngoId;
        }
        if (extra?.volunteerId) {
          volunteerId = typeof extra.volunteerId === 'object' ? extra.volunteerId._id : extra.volunteerId;
        } else if (extra?.assignedTo) {
          volunteerId = typeof extra.assignedTo === 'object' ? extra.assignedTo._id : extra.assignedTo;
        }
        volunteerIdForState = volunteerId;
        // Fetch pickup/drop location from donation if possible
        if (donationId) {
          try {
            const donation = (await import("@/lib/api/admin/donations").then(m => m.AdminDonationsApi.getById(donationId))).data;
            pickupLocation = donation?.pickupLocation || '';
          } catch {}
        }
        // Fetch drop location from NGO if possible
        if (ngoId) {
          try {
            const ngo = (await import("@/lib/api/admin/ngos").then(m => m.AdminNGOsApi.adminGetById(ngoId))).data;
            dropLocation = ngo?.address || '';
          } catch {}
        }
        // Fetch volunteer name if possible
        if (volunteerId) {
          try {
            const volunteer = (await import("@/lib/api/admin/user").then(m => m.getUserById(volunteerId)));
            // The API returns the user object as { data: { ...userFields } }
            const v = volunteer?.data || volunteer;
            volunteerName = v?.name || v?.fullName || v?.username || v?.email || volunteerId;
          } catch {
            volunteerName = volunteerId;
          }
        }
        const statusValue = extra?.status || '';

        setTask({
          title: (extra?.title ?? ""),
          status: statusValue,
          volunteer: volunteerName,
          volunteerId: volunteerIdForState,
          ngoName: (extra?.ngoId && typeof extra.ngoId === 'object' ? extra.ngoId.name : ''),
          ngoId,
          donationId,
          pickupLocation,
          dropLocation,
          category: extra?.category || '',
          condition: extra?.condition || '',
          description: extra?.description || '',
          quantity: extra?.quantity || '',
        });
        setStatus(statusValue);
      } catch (err) {
        setError("Task not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!task) return;
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as TaskStatus);
    setTask({ ...task, status: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Ensure title is present and not empty
      const safeTitle = typeof task.title === "string" && task.title !== undefined && task.title !== null ? task.title.trim() : "";
      if (!safeTitle) {
        setError("Title is required and cannot be empty.");
        setSaving(false);
        return;
      }
      // Only send fields allowed by backend Task type
      const payload: any = {
        title: safeTitle,
        status: status,
      };
      if (typeof task.description === "string") payload.description = task.description;
      if (typeof task.ngoName === "string") payload.ngoName = task.ngoName;
      // Only send dueDate if it's a valid date string
      if (typeof task.dropLocation === "string" && !isNaN(Date.parse(task.dropLocation))) {
        payload.dueDate = new Date(task.dropLocation).toISOString();
      }
      // Always send valid IDs if present
      if (typeof task.donationId === 'string' && task.donationId) payload.donationId = task.donationId;
      if (typeof task.ngoId === 'string' && task.ngoId) payload.ngoId = task.ngoId;
      if (typeof task.volunteerId === 'string' && /^[a-fA-F0-9]{24}$/.test(task.volunteerId)) {
        payload.volunteerId = task.volunteerId;
        payload.assignedTo = task.volunteerId;
      }
      if (typeof task.pickupLocation === "string" && task.pickupLocation) payload.location = task.pickupLocation;
      try {
        await updateAdminTask(id, payload);
        pushToast({ title: 'Task saved', tone: 'success' });
        if (payload.volunteerId || payload.assignedTo) {
          pushToast({ title: 'Volunteer has been notified by e‑mail', tone: 'info' });
        }
        router.push(`/admin/tasks`);
      } catch (err: any) {
        pushToast({ title: 'Unable to save task', description: err?.message || '', tone: 'error' });
      }
    } catch (err: any) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading task...</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-white p-6 text-sm text-rose-600">{error}</div>;
  if (!task) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Task not found.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Task</h1>
        <p className="text-sm text-gray-500">Update task details and assignment</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={task.title || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                minLength={1}
                placeholder="Enter task title"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Status</label>
              <select
                name="status"
                value={status}
                onChange={handleStatusChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Assigned Volunteer</label>
              <input
                type="text"
                name="volunteer"
                value={task.volunteer || ""}
                className="w-full border rounded px-3 py-2 bg-gray-100"
                placeholder="Volunteer name"
                readOnly
              />
              {/* Hidden input for volunteerId for clarity */}
              <input
                type="hidden"
                name="volunteerId"
                value={task.volunteerId || ""}
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium mb-1">NGO</label>
              <input
                type="text"
                name="ngoName"
                value={task.ngoName || ""}
                className="w-full border rounded px-3 py-2 bg-gray-100"
                placeholder="NGO name"
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Pickup Location</label>
              <input
                type="text"
                name="pickupLocation"
                value={task.pickupLocation || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Pickup location"
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Drop Location</label>
              <input
                type="text"
                name="dropLocation"
                value={task.dropLocation || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Drop location"
                readOnly
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => router.push(`/admin/tasks/${id}`)} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
