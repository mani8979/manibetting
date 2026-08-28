import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pz_token') || null);
  const [loading, setLoading] = useState(true);

  // We use a ref-style callback pattern to avoid circular deps with PlayZoneContext
  const onLoginCallbacks = [];
  const onLogoutCallbacks = [];

  const registerOnLogin = (cb) => onLoginCallbacks.push(cb);
  const registerOnLogout = (cb) => onLogoutCallbacks.push(cb);

  useEffect(() => {
    if (token) {
      localStorage.setItem('pz_token', token);
      fetchUser(token);
    } else {
      localStorage.removeItem('pz_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: 'Server error. Is the backend running?' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: 'Server error. Is the backend running?' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
