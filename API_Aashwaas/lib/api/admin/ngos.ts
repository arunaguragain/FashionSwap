export const AdminNGOsApi = {
  adminList: async () => ({ data: [] }),
};

export const NGOsApi = {
  list: async () => ({ data: [] }),
};

export function resolveNgoPhotoUrl(photo?: string | null) {
  return photo || '/images/user.png';
}
