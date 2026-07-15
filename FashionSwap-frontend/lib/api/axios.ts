import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return value ? decodeURIComponent(value[1]) : null;
};

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        // Token is now handled by the backend reading the httpOnly cookie directly
        // via req.cookies.auth_token, so we don't need to manually attach it here.


        const csrfToken = getCookie('x-csrf-token');
        if (csrfToken && ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
            config.headers['x-csrf-token'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;