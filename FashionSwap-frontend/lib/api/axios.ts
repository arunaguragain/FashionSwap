import axios from 'axios';

// Read the env var but sanitize it so malformed values like ":5050" don't
// produce invalid URLs in the browser (which was causing requests to go to
// ":5050/..." and fail with ERR_CONNECTION_REFUSED).
let rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
rawBase = String(rawBase || '').trim();
let BASE_URL = 'http://localhost:5050';
try {
    if (!rawBase) {
        BASE_URL = 'http://localhost:5050';
    } else if (rawBase.startsWith(':')) {
        // allow ":5050" -> assume localhost
        BASE_URL = `http://localhost${rawBase}`;
    } else if (!/^https?:\/\//i.test(rawBase)) {
        // missing protocol, assume http
        BASE_URL = `http://${rawBase}`;
    } else {
        BASE_URL = rawBase;
    }
} catch (e) {
    // fallback to localhost
    BASE_URL = 'http://localhost:5050';
}

if (typeof window !== 'undefined') {
    // In browser/runtime, use the same origin and rely on the Next.js proxy.
    // This avoids cross-origin cookie/SameSite issues when frontend runs on 3000
    // and backend runs on 5050 during local development.
    BASE_URL = '';
    // help debugging in the browser console when requests fail
    // eslint-disable-next-line no-console
    console.debug('[api] using BASE_URL ->', BASE_URL || 'relative');
}

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