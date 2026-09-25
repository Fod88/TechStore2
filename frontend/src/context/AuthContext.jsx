import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service';
import { setUnauthorizedHandler } from '../services/api';
import { TOKEN_KEY, clearSession, decodeJwt, loadSession, saveSession } from '../utils/session';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  // Lazy initial state: the session is restored synchronously, so guards never flash a redirect on refresh.
  const [session, setSession] = useState(() => loadSession());

  const logout = useCallback(
    ({ expired = false } = {}) => {
      clearSession();
      setSession(null);
      if (expired) toast.info('Your session has expired. Please sign in again.');
    },
    [toast]
  );

  // Global 401 handling from the axios interceptor
  useEffect(() => {
    setUnauthorizedHandler(() => logout({ expired: true }));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Sign out proactively when the JWT's own expiry passes
  useEffect(() => {
    if (!session) return undefined;
    const exp = decodeJwt(session.token)?.exp;
    if (!exp) return undefined;
    const remaining = exp * 1000 - Date.now();
    if (remaining <= 0) {
      logout({ expired: true });
      return undefined;
    }
    const timer = setTimeout(() => logout({ expired: true }), Math.min(remaining, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [session, logout]);

  // Keep multiple tabs in sync (sign in / out in one tab affects the others)
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === TOKEN_KEY) setSession(loadSession());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async (credentials) => {
    const next = await authService.login(credentials);
    saveSession(next);
    setSession(next);
    return next.user;
  }, []);

  // The backend's register endpoint does not return a token, so sign the new user in right after.
  // Resolves to true when that automatic sign-in worked.
  const register = useCallback(async (payload) => {
    await authService.register(payload);
    try {
      const next = await authService.login({ email: payload.email, password: payload.password });
      saveSession(next);
      setSession(next);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isAdmin: session?.user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [session, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
