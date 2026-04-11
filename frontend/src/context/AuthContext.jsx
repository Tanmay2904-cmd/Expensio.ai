import React, { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [user, setUser] = useState(() => localStorage.getItem('user'));

  const login = async (username, password) => {
    const res = await axiosInstance.post('/api/auth/login', { username, password });
    const { token, role, userId } = res.data; // Data is already unwrapped by interceptor
    setToken(token);
    setRole(role);
    setUser(username);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', username);
    localStorage.setItem('userId', userId);
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
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 