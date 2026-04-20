import React, { useState } from 'react';
import { Box, Button, MenuItem, TextField, Typography, CircularProgress, useTheme, InputAdornment } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BadgeIcon from '@mui/icons-material/Badge';

const roles = ['USER', 'ADMIN'];

const UserForm = ({ initialValues = {}, onSubmit }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [form, setForm] = useState({
    name: initialValues.name || '',
    role: initialValues.role || 'USER',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name required';
    if (!initialValues.id && !form.password) errs.password = 'Password required';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.03)',
      '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <TextField
        label="Username"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        sx={fieldSx}
        error={!!errors.name}
        helperText={errors.name}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          )
        }}
      />

      <TextField
        select
        label="Role"
        name="role"
        value={form.role}
        onChange={handleChange}
        fullWidth
        sx={fieldSx}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BadgeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          )
        }}
      >
        {roles.map((r) => (
          <MenuItem key={r} value={r}>
            {r.charAt(0) + r.slice(1).toLowerCase()}
          </MenuItem>
        ))}
      </TextField>

      {!initialValues.id && (
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          sx={fieldSx}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            )
          }}
        />
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{
          mt: 1, py: 1.5,
          borderRadius: '12px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        {loading
          ? <CircularProgress size={22} color="inherit" />
          : initialValues.id ? 'Update User' : 'Add User'
        }
      </Button>
    </Box>
  );
};

export default UserForm;