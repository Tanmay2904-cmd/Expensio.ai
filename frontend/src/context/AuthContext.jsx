import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { startBackendPing, stopBackendPing } from '../utils/axiosConfig';

const AuthContext = createContext();

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getStoredToken = () => {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
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
  const [role, setRole] = useState(() => {
    const t = getStoredToken();
    return t ? localStorage.getItem('role') : null;
  });
  const [user, setUser] = useState(() => {
    const t = getStoredToken();
    return t ? localStorage.getItem('user') : null;
  });

  const login = async (username, password) => {
    const res = await axiosInstance.post('/api/auth/login', { username, password });
    const { token: newToken, role: newRole, username: serverUsername, userId } = res.data;
    setToken(newToken);
    setRole(newRole);
    setUser(serverUsername || username);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('user', serverUsername || username);
    localStorage.setItem('userId', userId);
    startBackendPing();
  };

  const register = async (username, password, role = 'USER') => {
    try {
      await axiosInstance.post('/api/auth/register', { name: username, password, role });
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
    localStorage.removeItem('userId');
    stopBackendPing();
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);