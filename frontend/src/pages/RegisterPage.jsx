import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, TextField, Typography, MenuItem,
  CircularProgress, Alert, Snackbar, useTheme, InputAdornment, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeIcon from '@mui/icons-material/Badge';

const roles = ['USER', 'ADMIN'];

const RegisterPage = () => {
  const { register } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('USER');
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
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      await register(username, password, role);
      setSnackbar({ open: true, message: 'Account created! Welcome 🎉', severity: 'success' });
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      const msg = err.message === 'Username already exists'
        ? 'Username already exists'
        : (err?.response?.data?.message || 'Registration failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.03)',
      transition: 'all 0.2s ease',
      '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
      '&.Mui-focused': {
        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
        background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
        '& fieldset': { borderColor: '#6366f1' },
      }
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
  };

  return (
    <Box sx={{
      minHeight: '100vh', width: '100%', display: 'flex', position: 'relative', overflow: 'hidden',
    }}>
      {/* Left decorative panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '45%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 40%, #06b6d4 100%)',
        position: 'relative', overflow: 'hidden', p: 6,
      }}>
        <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -100, left: -100 }} />
        <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -50, right: -80 }} />
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <Box sx={{
            width: 100, height: 100, mx: 'auto', mb: 3,
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', p: 1.5,
          }}>
            <Box component="img" src="/logo.png" alt="Expensio Logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Join Expensio</Typography>
            <Box sx={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '8px', px: 1, py: 0.25, backdropFilter: 'blur(8px)',
            }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', color: 'white' }}>AI</Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.7, maxWidth: 280, mx: 'auto' }}>
            Start tracking your expenses smarter with AI-powered insights.
          </Typography>
        </Box>
      </Box>

      {/* Right: Register form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 5 },
        background: isDark ? 'rgba(8,8,24,0.97)' : 'rgba(240,242,255,0.97)',
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px', overflow: 'hidden',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}>
              <img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Typography variant="h5" sx={{
              fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Expensio</Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75, letterSpacing: '-0.02em' }}>Create account</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Already have one?{' '}
            <Box component="span" onClick={() => navigate('/login')}
              sx={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Sign in
            </Box>
          </Typography>

          {error && (
            <Alert severity="error" sx={{
              mb: 3, borderRadius: '12px',
              background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)}
              fullWidth sx={fieldSx} autoComplete="username"
              error={!!fieldErrors.username} helperText={fieldErrors.username}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} fullWidth sx={fieldSx} autoComplete="new-password"
              error={!!fieldErrors.password} helperText={fieldErrors.password}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
              }}
            />
            <TextField select label="Role" value={role} onChange={e => setRole(e.target.value)} fullWidth sx={fieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
            >
              {roles.map(r => <MenuItem key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</MenuItem>)}
            </TextField>

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
              sx={{
                mt: 0.5, py: 1.6, borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 30px rgba(99,102,241,0.5)', transform: 'translateY(-2px)' },
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;