import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vibe_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('vibe_token') || null);

  const login = useCallback(async (email, password) => {
    // ── Login via API ──
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const userData = { ...data.user, role: data.user.role || 'user' };
    localStorage.setItem('vibe_token', data.token);
    localStorage.setItem('vibe_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (username, fullName, email, phone, password, honeypot = '') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, email, phone, password, honeypot }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    const userData = { ...data.user, role: 'user' };
    localStorage.setItem('vibe_token', data.token);
    localStorage.setItem('vibe_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_user');
    setToken(null);
    setUser(null);
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      logout();
      window.location.href = '/signin';
    }
    return res;
  }, [token, logout]);

  const updateProfile = useCallback(async (username, fullName, email, phone, password) => {
    const res = await authFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, fullName, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');
    localStorage.setItem('vibe_token', data.token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, [authFetch]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout, authFetch, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

