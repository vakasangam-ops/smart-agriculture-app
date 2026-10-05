import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('krishi_token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired, logging in as demo farmer');
          await switchRole('FARMER');
        }
      } else {
        // Auto demo-login as Farmer for zero friction on first load
        await switchRole('FARMER');
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (identifier, password) => {
    setError(null);
    try {
      const res = await api.login(identifier, password);
      localStorage.setItem('krishi_token', res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const switchRole = async (role) => {
    setError(null);
    try {
      const res = await api.demoLogin(role);
      localStorage.setItem('krishi_token', res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      console.error('Role switch failed:', err);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.register(userData);
      localStorage.setItem('krishi_token', res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('krishi_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, switchRole, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
