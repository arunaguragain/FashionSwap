// "use server";
import { getMyTasks, acceptTask, completeTask, cancelTask } from "@/lib/api/volunteer/tasks";
import { VolunteerTask, TaskStatus } from "@/app/(platform)/tasks/schemas";

// Fetch all tasks for the volunteer, with optional params for filtering
export async function fetchVolunteerTasks(params?: { status?: TaskStatus; search?: string }) {
  const data = await getMyTasks();
  // Optionally filter client-side if params provided
  if (params?.status) {
    return data.filter(task => task.status === params.status);
  }
  return data;
}

export async function acceptVolunteerTask(taskId: string): Promise<VolunteerTask> {
  return await acceptTask(taskId);
}

export async function completeVolunteerTask(taskId: string): Promise<VolunteerTask> {
  return await completeTask(taskId);
}

export async function cancelVolunteerTask(taskId: string): Promise<any> {
  return await cancelTask(taskId);
}


export type { TaskStatus };

