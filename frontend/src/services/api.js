import axios from 'axios';
import { getToken } from '../utils/session';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// AuthContext registers a handler here so the API layer can report an expired/invalid session
// without importing React code.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // When uploading a file (product images) the body is FormData. The instance-level
  // 'Content-Type: application/json' default must not go out on these requests: the browser needs
  // to set 'multipart/form-data; boundary=...' itself, or multer on the backend can't parse the body
  // at all (every field, including the file, silently fails validation).
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
    // Image uploads to Cloudinary take longer than a plain JSON request, especially on slower connections.
    config.timeout = Math.max(config.timeout ?? 0, 30000);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = ['/users/login', '/users/register'].includes(error.config?.url);
    // A 401 from login/register just means wrong credentials, so only treat other 401s as an expired session.
    if (error.response?.status === 401 && !isAuthEndpoint && getToken()) unauthorizedHandler?.();
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Check your connection and try again.';
  if (!error?.response) return error?.message && !error?.isAxiosError ? error.message : "Can't reach the server. Check your connection and try again.";
  const data = error.response.data;
  if (typeof data === 'string' && data.length < 200) return data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e) => e.msg ?? e.message ?? e).join(' ');
  }
  // The backend replies { error: '...' } (and, in one cart branch, the misspelled { errorr: '...' })
  return data?.error ?? data?.errorr ?? data?.message ?? fallback;
}

export default api;
