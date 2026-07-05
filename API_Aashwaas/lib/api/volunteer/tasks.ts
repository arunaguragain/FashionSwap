import axios from "../axios";
import { API } from "../endpoints";
import { VolunteerTask } from "../../../app/(platform)/tasks/schemas";

export const getMyTasks = async (): Promise<VolunteerTask[]> => {
  try {
    const response = await axios.get(API.TASK.LIST);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch tasks"
    );
  }
};

export const acceptTask = async (taskId: string): Promise<VolunteerTask> => {
  try {
    const response = await axios.post(API.TASK.acceptTask(taskId));
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to accept task"
    );
  }
};

export const completeTask = async (taskId: string): Promise<VolunteerTask> => {
  try {
    const response = await axios.post(API.TASK.completeTask(taskId));
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to complete task"
    );
  }
};

export const cancelTask = async (taskId: string): Promise<any> => {
  try {
    const response = await axios.delete(API.TASK.cancelTask(taskId));
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to cancel task"
    );
  }
};
