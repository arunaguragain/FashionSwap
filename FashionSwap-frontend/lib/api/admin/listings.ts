import { fetchJSON } from "../../api";

export function getAdminListings(query: string = "", page: number = 1, limit: number = 20) {
  let url = `/api/admin/listings?page=${page}&limit=${limit}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  return fetchJSON(url);
}

export function deleteAdminListing(listingId: string) {
  return fetchJSON(`/api/admin/listings/${listingId}`, { method: "DELETE" });
}
