import { getListings } from '@/lib/api';

export const DonationsApi = {
  list: async () => {
    try {
      const data = await getListings();
      return {
        data: Array.isArray(data) ? data : data?.data ?? [],
      };
    } catch (error) {
      return {
        data: [],
        error,
      };
    }
  },
};

export default DonationsApi;
