import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Button, TextField, Typography, Paper, Grid, CircularProgress, Alert, Snackbar, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Login } from '@mui/icons-material';

const LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const LoginPage = () => {
  const { login } = useAuth();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!username) errs.username = 'Username required';
    if (!password) errs.password = 'Password required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials or try again later.');
      setSnackbar({ open: true, message: 'Login failed.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      px: 2,
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Paper elevation={0} sx={{ 
        p: { xs: 4, md: 6 }, 
        borderRadius: 4, 
        maxWidth: 420,
        width: '100%',
        m: 'auto',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 15, 35, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 35px 70px rgba(0, 0, 0, 0.2)',
        }
      }}>
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
                borderRadius: 16,
                p: 2,
                mb: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <img src={LOGO_URL} alt="Logo" style={{ 
                  height: 48, 
                  borderRadius: 12, 
                  background: '#fff', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} />
              </Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                mb: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 1
              }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                fontWeight: 500
              }}>
                Sign in to your Expensio account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ 
                mb: 3, 
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.05)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-focused': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)',
                    }
                  }
                }}
                autoComplete="username"
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-focused': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)',
                    }
                  }
                }}
                autoComplete="current-password"
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                fullWidth 
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                sx={{ 
                  fontWeight: 700, 
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }} 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate('/register')}
                  sx={{ 
                    fontWeight: 600,
                    color: '#6366f1',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          </Paper>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}
        >
                {snackbar.message}
              </Alert>
            </Snackbar>
    </Box>
  );
};

export default LoginPage; 