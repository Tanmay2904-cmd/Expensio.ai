import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  IconButton, Box, TextField, InputAdornment, useTheme, Chip, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const getGridSx = (isDark) => ({
  border: 0,
  fontFamily: '"Inter", "Roboto", sans-serif',
  fontSize: '0.875rem',
  '& .MuiDataGrid-columnHeaders': {
    background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
    borderRadius: '12px',
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiDataGrid-row:hover': {
    background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
  },
});

const ActionBtn = ({ onClick, icon, color }) => (
  <IconButton onClick={onClick} size="small" sx={{
    width: 30, height: 30,
    background: `${color}18`,
    color,
    borderRadius: '8px',
    '&:hover': { background: `${color}30` },
    mr: 0.5,
  }}>
    {icon}
  </IconButton>
);

const ExpenseTable = ({ expenses, categories, users, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');

  const filteredExpenses = useMemo(() => {
    if (!search) return expenses;
    const lower = search.toLowerCase();
    return expenses.filter((row) =>
      row.description?.toLowerCase().includes(lower) ||
      row.category?.name?.toLowerCase().includes(lower)
    );
  }, [search, expenses]);

  const columns = [
    {
      field: 'amount', headerName: 'Amount', width: 120,
      renderCell: ({ value }) => (
        <Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
          ₹{Number(value).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'category', headerName: 'Category', width: 140,
      renderCell: ({ value }) => value?.name ? (
        <Chip label={value.name} size="small" sx={{
          background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600, fontSize: '0.7rem', height: 22,
        }} />
      ) : null,
    },
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'actions', headerName: '', width: 100,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex' }}>
          <ActionBtn onClick={() => onEdit(row)} icon={<EditIcon sx={{ fontSize: 16 }} />} color="#6366f1" />
          <ActionBtn onClick={() => onDelete(row.id)} icon={<DeleteIcon sx={{ fontSize: 16 }} />} color="#ef4444" />
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.03)',
              '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
          }}
        />
      </Box>

      {/* Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredExpenses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">No expenses found</Typography>
          </Box>
        ) : (
          filteredExpenses.map((row) => (
            <Box key={row.id} sx={{
              p: 2, mb: 1.5,
              borderRadius: '14px',
              border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.12)',
              background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.8)',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(99,102,241,0.06)',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                <Typography sx={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                  ₹{Number(row.amount).toLocaleString('en-IN')}
                </Typography>
                {row.category?.name && (
                  <Chip label={row.category.name} size="small" sx={{
                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: isDark ? '#a5b4fc' : '#4f46e5',
                    fontWeight: 600, fontSize: '0.68rem', height: 20,
                  }} />
                )}
              </Box>
              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.4 }}>
                {row.description}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.date}
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                <ActionBtn onClick={() => onEdit(row)} icon={<EditIcon sx={{ fontSize: 16 }} />} color="#6366f1" />
                <ActionBtn onClick={() => onDelete(row.id)} icon={<DeleteIcon sx={{ fontSize: 16 }} />} color="#ef4444" />
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Desktop Table */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', width: '100%' }}>
        <DataGrid
          rows={filteredExpenses}
          columns={columns}
          autoHeight
          pageSize={8}
          sx={getGridSx(isDark)}
        />
      </Box>
    </Box>
  );
};

export default ExpenseTable;