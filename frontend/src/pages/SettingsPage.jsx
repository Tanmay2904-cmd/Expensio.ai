import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Switch, FormControlLabel, Divider, CircularProgress, Alert } from '@mui/material';
import axiosInstance from '../utils/axiosConfig';

const SettingsPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [themeDark, setThemeDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Connects to Spring Boot API: /api/users/me
    const fetchProfile = async () => {
      setProfileLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/api/users/me');
        setName(res.data.name || '');
        // Optionally set themeDark from preferences if available
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Connects to Spring Boot API: /api/users/me (PUT)
      await axiosInstance.put('/api/users/me', { name });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Connects to Spring Boot API: /api/users/me/password (POST)
      await axiosInstance.post('/api/users/me/password', { password });
      setSuccess('Password changed successfully.');
      setPassword('');
    } catch (err) {
      setError('Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: 'background.default', py: { xs: 2, md: 4 }, px: { xs: 1, md: 3 } }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Settings</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Profile</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <TextField
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                size="small"
                disabled={profileLoading || loading}
              />
              <Button variant="contained" sx={{ minWidth: 120 }} onClick={handleProfileSave} disabled={loading || profileLoading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
              </Button>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Change Password</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <TextField
                label="New Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                size="small"
                disabled={loading}
              />
              <Button variant="contained" sx={{ minWidth: 120 }} onClick={handlePasswordChange} disabled={loading || !password}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Change'}
              </Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Preferences</Typography>
            <FormControlLabel
              control={<Switch checked={themeDark} onChange={e => setThemeDark(e.target.checked)} />}
              label="Dark Mode"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage; 