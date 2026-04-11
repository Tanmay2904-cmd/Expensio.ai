import React, { useState } from 'react';
import {
  Box, Button, MenuItem, TextField, Typography, CircularProgress,
  Snackbar, Alert, InputAdornment, Divider, Chip, useTheme
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import axiosInstance from '../utils/axiosConfig';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const ExpenseForm = ({ initialValues = {}, onSubmit, categories, users }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [form, setForm] = useState({
    amount: initialValues.amount || '',
    description: initialValues.description || '',
    date: initialValues.date || '',
    categoryId: initialValues.categoryId || '',
    userId: initialValues.userId || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [nlpInput, setNlpInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.description) errs.description = 'Description required';
    if (!form.date) errs.date = 'Date required';
    if (!form.categoryId) errs.categoryId = 'Category required';
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
      setSnackbar({ open: true, message: '✅ Expense saved!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save expense.', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleAutoCategorize = async () => {
    if (!form.description) {
      setSnackbar({ open: true, message: 'Enter a description first', severity: 'warning' });
      return;
    }
    setAiLoading(true);
    try {
      const res = await axiosInstance.post('/api/ai/categorize', { description: form.description });
      const predicted = res.data.category;
      const matched = categories.find(c => c.name.toLowerCase() === predicted.toLowerCase());
      if (matched) {
        setForm({ ...form, categoryId: matched.id });
        setSnackbar({ open: true, message: `✨ Auto-categorized: ${matched.name}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: `AI suggested: ${predicted}, couldn't map it.`, severity: 'info' });
      }
    } catch {
      setSnackbar({ open: true, message: 'AI categorize failed.', severity: 'error' });
    } finally { setAiLoading(false); }
  };

  const handleMagicExtract = async () => {
    if (!nlpInput) return;
    setAiLoading(true);
    try {
      const res = await axiosInstance.post('/api/ai/extract-expense', { text: nlpInput });
      const raw = res.data.replace(/```json/g, '').replace(/```/g, '').trim();
      const details = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const matched = categories.find(c => c.name.toLowerCase() === (details.categoryName || '').toLowerCase());
      setForm({
        ...form,
        amount: details.amount || form.amount,
        description: details.description || form.description,
        date: details.date || form.date,
        categoryId: matched ? matched.id : form.categoryId,
      });
      setNlpInput('');
      setSnackbar({ open: true, message: '✨ Form auto-filled!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to extract. Try rephrasing.', severity: 'error' });
    } finally { setAiLoading(false); }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.03)',
      '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
  };

  return (
    <Box sx={{ pt: 1 }}>
      {/* NLP Magic Input */}
      <Box sx={{
        mb: 2.5, p: 2, borderRadius: '14px',
        background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
        border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.15)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: '#818cf8' }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#a5b4fc' : '#6366f1', letterSpacing: '0.04em' }}>
            MAGIC QUICK ADD
          </Typography>
          <Chip label="AI" size="small" sx={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={nlpInput}
            onChange={e => setNlpInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleMagicExtract()}
            placeholder="e.g. 'Spent ₹500 on lunch yesterday'"
            size="small"
            fullWidth
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-root': {
                ...fieldSx['& .MuiOutlinedInput-root'],
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              }
            }}
          />
          <Button
            onClick={handleMagicExtract}
            disabled={aiLoading || !nlpInput}
            variant="contained"
            size="small"
            sx={{
              borderRadius: '10px', px: 2, whiteSpace: 'nowrap', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontWeight: 700, fontSize: '0.78rem',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }
            }}
          >
            {aiLoading ? <CircularProgress size={14} color="inherit" /> : '✨ Fill'}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)' }} />

      {/* Form Fields */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange}
          required fullWidth error={!!errors.amount} helperText={errors.amount} sx={fieldSx}
          InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
        />
        <TextField
          label="Description" name="description" value={form.description} onChange={handleChange}
          required fullWidth error={!!errors.description} helperText={errors.description} sx={fieldSx}
          InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
        />
        <TextField
          label="Date" name="date" type="date" value={form.date} onChange={handleChange}
          InputLabelProps={{ shrink: true }} required fullWidth error={!!errors.date} helperText={errors.date} sx={fieldSx}
          InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            select label="Category" name="categoryId" value={form.categoryId} onChange={handleChange}
            required fullWidth error={!!errors.categoryId} helperText={errors.categoryId} sx={fieldSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          >
            {categories?.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <Button
            variant="outlined" onClick={handleAutoCategorize}
            disabled={aiLoading || !form.description}
            sx={{
              height: 56, flexShrink: 0, borderRadius: '10px', px: 1.5,
              borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8',
              fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
              '&:hover': { borderColor: '#6366f1', background: 'rgba(99,102,241,0.07)' },
              mb: errors.categoryId ? 3 : 0,
            }}
          >
            {aiLoading ? <CircularProgress size={16} /> : '✨ AI'}
          </Button>
        </Box>
        {users && (
          <TextField
            select label="User" name="userId" value={form.userId} onChange={handleChange} fullWidth sx={fieldSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          >
            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </TextField>
        )}
        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{
          mt: 0.5, py: 1.4, borderRadius: '12px', fontWeight: 700,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 24px rgba(99,102,241,0.45)' }
        }}>
          {loading ? <CircularProgress size={22} color="inherit" /> : (initialValues.id ? 'Update Expense' : 'Add Expense')}
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ExpenseForm;