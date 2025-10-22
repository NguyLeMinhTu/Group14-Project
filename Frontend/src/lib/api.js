import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Create axios instance so we don't mutate global defaults accidentally
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // send cookies (refresh token) for refresh endpoint
});

const ACCESS_KEY = 'accessToken';
const LEGACY_KEY = 'token';

export function getAccessToken() {
    return localStorage.getItem(ACCESS_KEY) || localStorage.getItem(LEGACY_KEY) || null;
}

export function setAccessToken(token) {
    if (token) {
        localStorage.setItem(ACCESS_KEY, token);
        // keep legacy key for other places in app that may still read `token`
        localStorage.setItem(LEGACY_KEY, token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

export function removeAccessToken() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(LEGACY_KEY);
    delete api.defaults.headers.common['Authorization'];
}

export function setAuthFromLocalStorage() {
    const token = getAccessToken();
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuth() {
    removeAccessToken();
}

// Attempt to refresh access token by calling backend POST /auth/refresh
export async function refreshAccessToken() {
    try {
        const res = await api.post('/auth/refresh');
        const { token } = res.data || {};
        if (token) {
            setAccessToken(token);
            return token;
        }
        throw new Error('No token in refresh response');
    } catch (err) {
        // refresh failed
        removeAccessToken();
        throw err;
    }
}

// Attach Authorization header to outgoing requests if we have an access token
api.interceptors.request.use((cfg) => {
    const token = getAccessToken();
    if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
    return cfg;
});

// Response interceptor to handle 401 -> try refresh -> retry original request once
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const status = error.response ? error.response.status : null;
        // Avoid infinite loop: only retry once
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshAccessToken();
                // set auth header for the retried request
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                // refresh failed -> fall through to reject
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
