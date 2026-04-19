import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  Typography, Paper, useTheme, Skeleton
} from '@mui/material';
import { Add } from '@mui/icons-material';
import CategoryTable from '../components/CategoryTable';
import CategoryForm from '../components/CategoryForm';

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
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
      },
      ...sx
    }}>
      {children}
    </Paper>
  );
};

const CategoriesPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try { const res = await axiosInstance.get('/api/categories'); setCategories(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = () => { setEditing(null); setOpen(true); };
  const handleEdit = (category) => { setEditing(category); setOpen(true); };
  const handleDelete = async (id) => { await axiosInstance.delete(`/api/categories/${id}`); fetchCategories(); };
  const handleSubmit = async (form) => {
    if (editing) await axiosInstance.put(`/api/categories/${editing.id}`, { ...editing, ...form });
    else await axiosInstance.post('/api/categories', form);
    setOpen(false);
    fetchCategories();
  };

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: 'calc(100vh - 100px)' }, pb: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, animation: 'fadeInUp 0.4s ease both' }}>
        <Box>
          <Typography variant="h4" sx={{
            fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Expense Categories
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {loading ? 'Loading...' : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'} configured`}
          </Typography>
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
          Add Category
        </Button>
      </Box>

      {/* Table Card */}
      <GlassCard sx={{ p: { xs: 2, md: 3 }, overflowX: 'auto', animation: 'fadeInUp 0.5s ease 100ms both', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : (
          <CategoryTable categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </GlassCard>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{
        sx: {
          borderRadius: '20px',
          background: isDark ? 'rgba(10,10,28,0.97)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(99,102,241,0.15)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700, pb: 1,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {editing ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <CategoryForm initialValues={editing || {}} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;