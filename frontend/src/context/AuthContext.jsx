import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { startBackendPing, stopBackendPing } from '../utils/axiosConfig';

const AuthContext = createContext();

// Decode JWT payload and check expiry without external library
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat malformed token as expired
  }
};

const getStoredToken = () => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    // Clear stale data immediately
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    return null;
  }
  return token;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getStoredToken());
  const [role, setRole] = useState(() => token ? localStorage.getItem('role') : null);
  const [user, setUser] = useState(() => token ? localStorage.getItem('user') : null);

  const login = async (username, password) => {
    const res = await axiosInstance.post('/api/auth/login', { username, password });
    const { token, role, username, userId } = res.data;
    setUser(username); // Data is already unwrapped by interceptor
    setToken(token);
    setRole(role);
    setUser(username);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', username);
    localStorage.setItem('userId', userId);
    startBackendPing(); // Start keep-alive ping after successful login
  };

  const register = async (username, password, role = 'USER') => {
    try {
      await axiosInstance.post('/api/auth/register', { name: username, password, role });
      // Optionally auto-login after register
      await login(username, password);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        throw new Error('Username already exists');
      }
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userId'); // ← Fixed: was missing before
    stopBackendPing(); // Stop keep-alive ping after logout
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
