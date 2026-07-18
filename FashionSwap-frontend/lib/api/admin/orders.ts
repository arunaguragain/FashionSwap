import { fetchJSON } from "../../api";

export function getAdminOrders(query: string = "", page: number = 1, limit: number = 20) {
  let url = `/api/admin/orders?page=${page}&limit=${limit}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  return fetchJSON(url);
}

export function deleteAdminOrder(orderId: string) {
  return fetchJSON(`/api/admin/orders/${orderId}`, { method: "DELETE" });
}
