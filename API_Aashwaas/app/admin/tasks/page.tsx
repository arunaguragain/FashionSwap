"use client";

import { useEffect, useState } from "react";
import { fetchAdminTasks } from "@/lib/actions/admin/task-actions";
import Link from "next/link";
import TaskTable from "./_components/TaskTable";
import { AdminDonationsApi } from "@/lib/api/admin/donations";
import { AdminNGOsApi } from "@/lib/api/admin/ngos";
import { getUserById } from "@/lib/api/admin/user";

function getDonorContactFromObj(d: any) {
  if (!d) return "-";
  const name = d.name || d.fullName || d.username || d.firstName || d.lastName || "";
  // Collect both email and phone number if available
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

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(7);

  useEffect(() => {
    async function fetchData() {
      const rawTasks = await fetchAdminTasks();
      const tasksWithDetails = await Promise.all(
        rawTasks.map(async (task: any) => {
          let donation = null;
          let ngo = null;
          let donorContact = "-";
          let volunteerName = "-";
          let title = typeof task.title === 'string' ? task.title : '';
          try {
            donation = task.donationId ? (await AdminDonationsApi.getById(task.donationId)).data : null;
            if (donation?.donorId && typeof donation.donorId === "object") {
              donorContact = getDonorContactFromObj(donation.donorId);
            } else if (donation?.donorId && typeof donation.donorId === "string") {
              try {
                const donor = await getUserById(donation.donorId);
                donorContact = getDonorContact(donor);
              } catch (err) {
                donorContact = "-";
              }
            }
            // Prefer donation.itemName as fallback for title
            if (!title) {
              title = donation?.itemName || '';
            }
          } catch (err) {}
          if (task.volunteerId) {
            try {
              const volunteer = await getUserById(task.volunteerId);
              volunteerName = volunteer?.data?.name || volunteer?.data?.fullName || volunteer?.data?.username || volunteer?.data?.email || volunteer?.data?.phoneNumber || task.volunteerId;
            } catch (err) {
              volunteerName = task.volunteerId;
            }
          }
          try {
            ngo = task.ngoId ? (await AdminNGOsApi.adminGetById(task.ngoId)).data : null;
          } catch {}
          return {
            ...task,
            title,
            pickupLocation: donation?.pickupLocation,
            dropLocation: ngo?.address,
            donorContact,
            ngoContact: ngo ? `${ngo.contactPerson || ""} (${ngo.phone || ngo.email || ""})` : "-",
            volunteer: volunteerName,
          };
        })
      );
      setTasks(tasksWithDetails);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Pagination logic
  const total = tasks.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pagedTasks = tasks.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold mb-4">Admin Task Management</h1>
      {loading ? (
        <div>Loading...</div>
      ) : total === 0 ? (
        <div>No tasks found.</div>
      ) : (
        <>
          <TaskTable tasks={pagedTasks} />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Showing {pagedTasks.length} of {total} entries</div>
            <div className="flex items-center gap-2">
              <button
                className={page <= 1
                  ? "rounded border border-gray-700 bg-gray-700 px-3 py-1 text-sm text-white opacity-80 cursor-not-allowed"
                  : "rounded border border-transparent bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700"
                }
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              {(() => {
                const pagesToShow: number[] = [];
                const start = Math.max(1, page - 2);
                const end = Math.min(pages, page + 2);
                if (start > 1) pagesToShow.push(1);
                if (start > 2) pagesToShow.push(-1);
                for (let i = start; i <= end; i++) pagesToShow.push(i);
                if (end < pages - 1) pagesToShow.push(-1);
                if (end < pages) pagesToShow.push(pages);
                return pagesToShow.map((pnum, i) =>
                  pnum === -1 ? (
                    <span key={`e-${i}`} className="px-2 text-sm text-gray-500">…</span>
                  ) : (
                    <button
                      key={pnum}
                      onClick={() => setPage(pnum)}
                      className={`rounded px-3 py-1 text-sm ${pnum === page ? "bg-sky-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                      {pnum}
                    </button>
                  )
                );
              })()}
              <button
                className={page >= pages
                  ? "rounded border border-gray-700 bg-gray-700 px-3 py-1 text-sm text-white opacity-80 cursor-not-allowed"
                  : "rounded border border-transparent bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700"
                }
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
