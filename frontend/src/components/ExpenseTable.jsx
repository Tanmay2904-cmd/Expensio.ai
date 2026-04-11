import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, TextField, InputAdornment, useTheme, Chip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Shared premium DataGrid sx styles
const getGridSx = (isDark) => ({
  border: 0,
  fontFamily: '"Inter", "Space Grotesk", sans-serif',
  fontSize: '0.875rem',
  '& .MuiDataGrid-columnHeaders': {
    background: isDark
      ? 'rgba(99,102,241,0.08)'
      : 'rgba(99,102,241,0.05)',
    borderBottom: isDark
      ? '1px solid rgba(99,102,241,0.15)'
      : '1px solid rgba(99,102,241,0.1)',
    borderRadius: '12px 12px 0 0',
    minHeight: '52px !important',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: isDark ? '#a5b4fc' : '#6366f1',
  },
  '& .MuiDataGrid-row': {
    transition: 'background 0.15s ease',
    '&:hover': {
      background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
    },
  },
  '& .MuiDataGrid-cell': {
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(99,102,241,0.06)',
    display: 'flex',
    alignItems: 'center',
    '&:focus': { outline: 'none' },
  },
  '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
  '& .MuiDataGrid-footerContainer': {
    borderTop: isDark ? '1px solid rgba(99,102,241,0.1)' : '1px solid rgba(99,102,241,0.08)',
    background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
    minHeight: 52,
  },
  '& .MuiDataGrid-virtualScroller': { overflow: 'auto' },
  '& .MuiTablePagination-root': { color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem' },
});

const SearchBar = ({ value, onChange, placeholder }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <TextField
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </InputAdornment>
        ),
        sx: {
          borderRadius: '10px',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)',
          '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
          '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
          '&.Mui-focused fieldset': { borderColor: '#6366f1' },
          '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
          fontSize: '0.875rem',
        }
      }}
      sx={{ width: { xs: '100%', sm: 260 } }}
    />
  );
};

const ActionBtn = ({ onClick, icon, color }) => (
  <IconButton
    onClick={onClick}
    size="small"
    sx={{
      width: 30, height: 30,
      borderRadius: '8px',
      background: `${color}18`,
      border: `1px solid ${color}30`,
      color,
      transition: 'all 0.2s ease',
      '&:hover': { background: `${color}28`, transform: 'scale(1.08)', borderColor: `${color}50` },
    }}
  >
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
    return expenses.filter(row => {
      const desc = row.description?.toLowerCase() || '';
      const cat = categories?.find(c => c.id === (row.category?.id || row.categoryId))?.name?.toLowerCase() || '';
      const user = users?.find(u => u.id === (row.user?.id || row.userId))?.name?.toLowerCase() || '';
      return desc.includes(lower) || cat.includes(lower) || user.includes(lower);
    });
  }, [search, expenses, categories, users]);

  const columns = [
    {
      field: 'amount', headerName: 'Amount', width: 110, sortable: true,
      align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
          ₹{value?.toFixed(2)}
        </Typography>
      )
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 150, sortable: true },
    {
      field: 'date', headerName: 'Date', width: 120, sortable: true,
      align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      )
    },
    {
      field: 'category', headerName: 'Category', width: 140, sortable: true,
      valueGetter: (params) => {
        if (!params?.row) return '';
        const catId = params.row.category?.id || params.row.categoryId;
        const cat = categories && catId ? categories.find(c => c.id === catId) : undefined;
        return cat ? cat.name : (params.row.category?.name || '');
      },
      renderCell: ({ value }) => value ? (
        <Chip label={value} size="small" sx={{
          background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600, fontSize: '0.72rem', height: 24,
        }} />
      ) : null
    },
    users && {
      field: 'user', headerName: 'User', width: 130, sortable: true,
      valueGetter: (params) => {
        if (!params?.row) return '';
        const userId = params.row.user?.id || params.row.userId;
        const user = users && userId ? users.find(u => u.id === userId) : undefined;
        return user ? user.name : (params.row.user?.name || '');
      },
      renderCell: ({ value }) => value ? (
        <Typography sx={{ fontSize: '0.83rem', fontWeight: 500 }}>{value}</Typography>
      ) : null
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false, filterable: false, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.7 }}>
          <ActionBtn onClick={() => onEdit(row)} icon={<EditIcon sx={{ fontSize: 15 }} />} color="#6366f1" />
          <ActionBtn onClick={() => onDelete(row.id)} icon={<DeleteIcon sx={{ fontSize: 15 }} />} color="#ef4444" />
        </Box>
      ),
    },
  ].filter(Boolean);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
          {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''}
        </Typography>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." />
      </Box>

      <Box sx={{
        borderRadius: '14px', overflow: 'hidden', flex: 1, minHeight: 0,
        border: isDark ? '1px solid rgba(99,102,241,0.12)' : '1px solid rgba(99,102,241,0.1)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(99,102,241,0.06)',
      }}>
        <DataGrid
          rows={filteredExpenses}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[8, 16, 32]}
          getRowId={row => row.id}
          disableSelectionOnClick
          sx={{ ...getGridSx(isDark), height: '100%' }}
        />
      </Box>
    </Box>
  );
};

export default ExpenseTable;