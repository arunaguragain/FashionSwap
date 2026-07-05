"use server";
import { TasksApi, Task, TaskStatus } from "@/lib/api/admin/tasks";
import { revalidatePath } from "next/cache";

export const handleFetchAdminTasks = async (params?: { status?: string; search?: string }) => {
  try {
    const res = await TasksApi.list(params);
    return { success: true, data: res.data };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch tasks" };
  }
};

export const handleFetchAdminTaskById = async (id: string) => {
  try {
    const res = await TasksApi.getById(id);
    return { success: true, data: res.data };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch task" };
  }
};

export const handleCreateAdminTask = async (payload: Partial<Task>) => {
  try {
    const res = await TasksApi.create(payload);
    if (res && res.data) {
      revalidatePath("/admin/tasks");
      return { success: true, message: "Task created successfully", data: res.data };
    }
    return { success: false, message: "Task creation failed" };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Task creation action failed" };
  }
};

export const handleUpdateAdminTask = async (
  id: string,
  payload: Partial<Task> & { assigneeName?: string }
) => {
  try {
    // If only assigneeName is present, use assign endpoint. Otherwise, use update endpoint.
    if (payload.assigneeName && Object.keys(payload).length === 1) {
      const res = await TasksApi.assign(id, payload.assigneeName);
      if (res && res.data) {
        revalidatePath("/admin/tasks");
        revalidatePath(`/admin/tasks/${id}`);
        return { success: true, data: res.data, message: "Task assigned" };
      }
      return { success: false, message: "Task assignment failed" };
    }

    if (TasksApi.update) {
      const { assigneeName, ...updatePayload } = payload;
      const res = await TasksApi.update(id, updatePayload as Partial<Task>);
      if (res && res.data) {
        revalidatePath("/admin/tasks");
        revalidatePath(`/admin/tasks/${id}`);
        return { success: true, data: res.data, message: "Task updated successfully" };
      }
      return { success: false, message: "Task update failed" };
    }

    return { success: false, message: "Update method not implemented in TasksApi." };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Task update action failed" };
  }
};

export const handleUpdateAdminTaskStatus = async (id: string, status: TaskStatus) => {
  try {
    const res = await TasksApi.updateStatus(id, status);
    if (res && res.data) {
      revalidatePath("/admin/tasks");
      revalidatePath(`/admin/tasks/${id}`);
      return { success: true, data: res.data };
    }
    return { success: false, message: "Update status failed" };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Update status action failed" };
  }
};

// --- Backwards-compatible client-friendly thin wrappers ---
// These call the same TasksApi methods but return raw data
export async function fetchAdminTasks(params?: { status?: string; search?: string }) {
  const res = await TasksApi.list(params);
  return res.data;
}

export async function fetchAdminTaskById(id: string) {
  const res = await TasksApi.getById(id);
  return res.data;
}

export async function createAdminTask(payload: Partial<Task>) {
  const res = await TasksApi.create(payload);
  return res.data;
}

export async function updateAdminTask(
  id: string,
  payload: Partial<Task> & { assigneeName?: string }
) {
  if (payload.assigneeName && Object.keys(payload).length === 1) {
    const res = await TasksApi.assign(id, payload.assigneeName);
    return res.data;
  }
  if (TasksApi.update) {
    const { assigneeName, ...updatePayload } = payload;
    const res = await TasksApi.update(id, updatePayload as Partial<Task>);
    return res.data;
  }
  throw new Error("Update method not implemented in TasksApi.");
}

export async function updateAdminTaskStatus(id: string, status: TaskStatus) {
  const res = await TasksApi.updateStatus(id, status);
  return res.data;
}

export async function removeAdminTask(id: string) {
  const res = await TasksApi.delete(id);
  return res.data;
}


