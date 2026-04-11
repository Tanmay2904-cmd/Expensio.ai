import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  Typography, Paper, useTheme, Chip, Skeleton
} from '@mui/material';
import { Add, AccountBalanceWallet } from '@mui/icons-material';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import { useAuth } from '../context/AuthContext';

const GlassCard = ({ children, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper elevation={0} sx={{
      borderRadius: '20px',
      background: isDark ? 'rgba(13,13,36,0.7)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.12)',
      boxShadow: isDark
        ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
        : '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      ...sx
    }}>
      {children}
    </Paper>
  );
};

const dialogPaperSx = (isDark) => ({
  borderRadius: '20px',
  background: isDark ? 'rgba(10,10,28,0.97)' : 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(24px)',
  border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(99,102,241,0.15)',
  boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
});

const ExpensesPage = () => {
  const { role } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const expPromise = role === 'ADMIN'
        ? axiosInstance.get('/api/expenses')
        : axiosInstance.get('/api/expenses/my/list');
      const catPromise = axiosInstance.get('/api/categories');
      const userPromise = role === 'ADMIN' ? axiosInstance.get('/api/users') : Promise.resolve({ data: [] });
      const [expRes, catRes, userRes] = await Promise.all([expPromise, catPromise, userPromise]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setUsers(userRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = () => { setEditing(null); setOpen(true); };
  const handleEdit = (expense) => { setEditing(expense); setOpen(true); };
  const handleDelete = async (id) => { await axiosInstance.delete(`/api/expenses/${id}`); fetchAll(); };
  const handleSubmit = async (form) => {
    const payload = {
  amount: parseFloat(form.amount),
  description: form.description,
  date: form.date,
  categoryId: form.categoryId,
};

    if (role === 'ADMIN') payload.user = users.find(u => u.id === parseInt(form.userId));
    if (editing) await axiosInstance.put(`/api/expenses/${editing.id}`, { ...payload, id: editing.id });
    else await axiosInstance.post('/api/expenses', payload);
    setOpen(false);
    fetchAll();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: 'calc(100vh - 100px)' }, pb: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, animation: 'fadeInUp 0.4s ease both' }}>
        <Box>
          <Typography variant="h4" sx={{
            fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            💸 {role === 'ADMIN' ? 'All Expenses' : 'My Expenses'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {loading ? 'Loading...' : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} tracked`}
            </Typography>
            {!loading && (
              <Chip
                label={`${expenses.length} total`}
                size="small"
                sx={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#818cf8', fontWeight: 700, fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={handleAdd}
          startIcon={<Add />}
          sx={{
            fontWeight: 700, borderRadius: '12px', px: 3, py: 1.3,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Add Expense
        </Button>
      </Box>

      {/* Main Table Card */}
      <GlassCard sx={{ p: { xs: 2, md: 3 }, overflowX: 'auto', animation: 'fadeInUp 0.5s ease 100ms both', flex: 1, minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : (
          <ExpenseTable
            expenses={expenses}
            categories={categories}
            users={role === 'ADMIN' ? users : undefined}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx(isDark) }}>
        <DialogTitle sx={{
          fontWeight: 700, pb: 1,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {editing ? '✏️ Edit Expense' : '✨ Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <ExpenseForm
            initialValues={editing ? { ...editing, categoryId: editing.category?.id, userId: editing.user?.id } : {}}
            onSubmit={handleSubmit}
            categories={categories}
            users={role === 'ADMIN' ? users : undefined}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ExpensesPage;