"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAdminTaskById, updateAdminTaskStatus } from "@/lib/actions/admin/task-actions";
import { AdminDonationsApi } from "@/lib/api/admin/donations";
import { AdminNGOsApi } from "@/lib/api/admin/ngos";
import { getUserById } from "@/lib/api/admin/user";
import type { TaskStatus } from "@/lib/api/admin/tasks";

export default function AdminTaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  type IdObj = { _id: string; [key: string]: any };
  type TaskWithDonation = {
    donationId?: string | IdObj;
    volunteerId?: string | IdObj;
    ngoId?: string | IdObj;
    [key: string]: any;
  };

  const [task, setTask] = useState<TaskWithDonation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const data = await fetchAdminTaskById(id) as TaskWithDonation;
        let donation = null;
        let ngo = null;
        let donorContact = "-";
        let volunteerName = "-";
        // Ensure donationId is a string
        let donationId = data.donationId;
        if (donationId && typeof donationId === 'object' && donationId._id) {
          donationId = donationId._id;
        }
        try {
          if (donationId && typeof donationId === 'string') {
            donation = (await AdminDonationsApi.getById(donationId)).data;
          } else {
            donation = null;
          }
          let donorId: string | { _id?: string } | undefined = donation?.donorId;
          if (donorId && typeof donorId === "object" && (donorId as { _id?: string })._id) {
            donorId = (donorId as { _id: string })._id;
          }
          if (donation?.donorId && typeof donation.donorId === "object") {
            donorContact = getDonorContactFromObj(donation.donorId);
          } else if (donorId && typeof donorId === "string") {
            try {
              const donor = await getUserById(donorId);
              donorContact = getDonorContact(donor);
            } catch (err) {
              donorContact = "-";
            }
          }
        } catch (err) {}
        let volunteerId = data.volunteerId;
        if (volunteerId && typeof volunteerId === 'object' && volunteerId._id) {
          volunteerId = volunteerId._id;
        }
        if (volunteerId && typeof volunteerId === 'string') {
          try {
            const volunteer = await getUserById(volunteerId);
            volunteerName = volunteer?.data?.name || volunteer?.data?.fullName || volunteer?.data?.username || volunteer?.data?.email || volunteer?.data?.phoneNumber || volunteerId;
          } catch (err) {
            volunteerName = volunteerId;
          }
        }
        let ngoId = data.ngoId;
        if (ngoId && typeof ngoId === 'object' && ngoId._id) {
          ngoId = ngoId._id;
        }
        try {
          ngo = ngoId && typeof ngoId === 'string' ? (await AdminNGOsApi.adminGetById(ngoId)).data : null;
        } catch {}
        // Always use the latest pickup/drop location from the task object if present, else fallback
        setTask({
          ...data,
          title: typeof data.title === 'string' && data.title ? data.title : (donation?.itemName || donation?.title || ''),
          pickupLocation: data.pickupLocation || donation?.pickupLocation || '',
          dropLocation: data.dropLocation || ngo?.address || '',
          donorContact,
          ngoContact: ngo ? `${ngo.contactPerson || ""} (${ngo.phone || ngo.email || ""})` : "-",
          ngoName: ngo?.name || null,
          volunteer: volunteerName,
        });
      } catch {
        setError("Unable to load task details.");
      } finally {
        setLoading(false);
      }
    }
    function getDonorContactFromObj(d: any) {
      if (!d) return "-";
      const name = d.name || d.fullName || d.username || d.firstName || d.lastName || "";
      const email = d.email || "";
      const phone = d.phoneNumber || d.phone || d.mobile || d.contactNumber || d.contact || "";
      let contact = "";
      if (email && phone) contact = `${email}, ${phone}`;
      else if (email) contact = email;
      else if (phone) contact = phone;
      if (name && contact) return `${name} (${contact})`;
      if (name) return name;
      if (contact) return contact;
      return "-";
    }
    function getDonorContact(donor: any) {
      if (!donor || !donor.data) return "-";
      return getDonorContactFromObj(donor.data);
    }
    fetchDetails();
  }, [id]);

  const [saving, setSaving] = useState(false);
  // type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"; // Use imported TaskStatus type

  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);

  useEffect(() => {
    if (task && typeof task.status === "string") {
      setStatus(task.status as TaskStatus);
    }
  }, [task]);

  const handleStatusUpdate = async () => {
    if (!status) return;
    setSaving(true);
    await updateAdminTaskStatus(id, status as TaskStatus);
    setSaving(false);
  };

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading task...</div>;
  }

  if (error || !task) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 max-w-4xl mx-auto">
        <p className="text-sm text-gray-600">{error ?? "Task not found."}</p>
        <a href="/admin/tasks" className="mt-4 inline-flex text-sm font-semibold text-blue-600">Back to Tasks</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
          <p className="text-sm text-gray-500">Task ID: {task._id || task.id || <span className='italic text-gray-400'>-</span>}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/admin/tasks/${id}/edit`}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit
          </a>
          <a
            href="/admin/tasks"
            className="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Back to list
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-0 md:grid-cols-[320px_1fr] items-start">
          <div className="max-w-[320px]">
            <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Donation:</span> {
                // Show donation name/title from fetched donation object if available, else fallback
                task.donationId && typeof task.donationId === 'object' && (task.donationId.itemName || task.donationId.title)
                  ? `${task.donationId.itemName || task.donationId.title}${task.donationId.category ? ' (' + task.donationId.category + ')' : ''}`
                  : (task.donationTitle || <span className="italic text-gray-400">-</span>)
              }</p>
              <p><span className="font-medium">Pickup Location:</span> {task.pickupLocation || <span className="italic text-gray-400">-</span>}</p>
              <p><span className="font-medium">Drop Location:</span> {task.dropLocation || <span className="italic text-gray-400">-</span>}</p>
              <p style={{whiteSpace: 'nowrap'}}><span className="font-medium" style={{marginRight: 4}}>Donor Contact:</span> {task.donorContact ? <span>{String(task.donorContact).replace(/\n|\r|\r\n/g, ' ')}</span> : <span className="italic text-gray-400">-</span>}</p>
              <p><span className="font-medium">NGO Contact:</span> {task.ngoContact || <span className="italic text-gray-400">-</span>}</p>
              <p><span className="font-medium">Assigned To:</span> {
                typeof task.volunteer === 'object' && task.volunteer !== null
                  ? (task.volunteer.name || task.volunteer.email || task.volunteer._id || JSON.stringify(task.volunteer))
                  : (task.volunteer || <span className="italic text-gray-400">Unassigned</span>)
              }</p>
              <p><span className="font-medium">NGO:</span> {task.ngoName ? task.ngoName : <span className="italic text-gray-400">Unassigned</span>}</p>
              <p><span className="font-medium">Status:</span> {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : <span className="italic text-gray-400">-</span>}</p>
              <p><span className="font-medium">Assigned At:</span> {task.assignedAt ? new Date(task.assignedAt).toLocaleString() : <span className="italic text-gray-400">-</span>}</p>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
  );
}
