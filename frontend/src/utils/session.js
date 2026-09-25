// Session persistence. The token lives in localStorage so the user stays signed in after a refresh.
// (Trade-off: localStorage is readable by any script on the page. If you later move the backend to
// httpOnly cookies, only this file and services/api.js need to change.)
export const TOKEN_KEY = 'techstore.token';
const USER_KEY = 'techstore.user';

export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false; // no exp claim: let the server decide
  return payload.exp * 1000 <= Date.now();
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSession({ user, token }) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable (private mode); session lasts until reload */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function loadSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    if (!token || !user) return null;
    if (isTokenExpired(token)) {
      clearSession();
      return null;
    }
    return { token, user };
  } catch {
    return null;
  }
}
