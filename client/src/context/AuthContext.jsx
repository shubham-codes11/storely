import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify stored session
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setStore(res.store || null);
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    setStore(res.store || null);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    setStore(null);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setStore(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    return await api.updatePassword({ currentPassword, newPassword });
  };

  // Quick 1-click Demo Role Switcher for seamless evaluation
  const switchDemoRole = async (targetRole) => {
    if (targetRole === 'guest') {
      logout();
      return;
    }
    const demoCredentials = {
      admin: { email: 'admin@verifiedreviews.com', password: 'Admin@123' },
      store_owner: { email: 'owner@apexelectronics.com', password: 'Owner@123' },
      user: { email: 'user@example.com', password: 'User@123' }
    };
    const creds = demoCredentials[targetRole];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        token,
        loading,
        login,
        register,
        logout,
        updatePassword,
        switchDemoRole,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStoreOwner: user?.role === 'store_owner',
        isNormalUser: user?.role === 'user'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
