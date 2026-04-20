import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Point all API calls to the deployed backend in production
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || ''

// Attach JWT token to every request automatically
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
