import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, TextField, InputAdornment, useTheme, Chip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const getGridSx = (isDark) => ({
  border: 0,
  fontFamily: '"Inter", "Roboto", sans-serif',
  fontSize: '0.875rem',
  '& .MuiDataGrid-columnHeaders': {
    background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
    borderBottom: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.1)',
    borderRadius: '12px 12px 0 0',
    minHeight: '52px !important',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: isDark ? '#a5b4fc' : '#6366f1',
  },
  '& .MuiDataGrid-row': {
    transition: 'background 0.15s ease',
    '&:hover': { background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)' },
  },
  '& .MuiDataGrid-cell': {
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(99,102,241,0.06)',
    display: 'flex', alignItems: 'center',
    '&:focus': { outline: 'none' },
  },
  '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
  '& .MuiDataGrid-footerContainer': {
    borderTop: isDark ? '1px solid rgba(99,102,241,0.1)' : '1px solid rgba(99,102,241,0.08)',
    background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
    minHeight: 52,
  },
  '& .MuiTablePagination-root': { color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem' },
});

const ActionBtn = ({ onClick, icon, color }) => (
  <IconButton onClick={onClick} size="small" sx={{
    width: 30, height: 30, borderRadius: '8px',
    background: `${color}18`, border: `1px solid ${color}30`, color,
    transition: 'all 0.2s ease',
    '&:hover': { background: `${color}28`, transform: 'scale(1.08)', borderColor: `${color}50` },
  }}>
    {icon}
  </IconButton>
);

const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#a855f7'];

const CategoryTable = ({ categories, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const lower = search.toLowerCase();
    return categories.filter(c => c.name?.toLowerCase().includes(lower));
  }, [search, categories]);

  const columns = [
    {
      field: 'name', headerName: 'Category Name', flex: 1, minWidth: 200,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" sx={{
          background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600, fontSize: '0.78rem', height: 26,
          textTransform: 'capitalize',
        }} />
      )
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false,
      align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.7 }}>
          <ActionBtn onClick={() => onEdit(row)} icon={<EditIcon sx={{ fontSize: 15 }} />} color="#6366f1" />
          <ActionBtn onClick={() => onDelete(row.id)} icon={<DeleteIcon sx={{ fontSize: 15 }} />} color="#ef4444" />
        </Box>
      ),
    },
  ];

  const searchBar = (
    <TextField
      size="small"
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search categories..."
      InputProps={{
        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
        sx: {
          borderRadius: '10px',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.03)',
          '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
          '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
          '&.Mui-focused fieldset': { borderColor: '#6366f1' },
          fontSize: '0.875rem',
        }
      }}
      sx={{ width: '100%' }}
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>{searchBar}</Box>

      {/* Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredCategories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">No categories found</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {filteredCategories.map((cat, i) => {
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <Box key={cat.id} sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: `1px solid ${color}25`,
                  background: isDark ? `${color}12` : `${color}08`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: `${color}20`,
                    border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color }}>
                      {cat.name?.charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography sx={{
                    fontWeight: 700, fontSize: '0.9rem',
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    textTransform: 'capitalize',
                  }}>
                    {cat.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <ActionBtn onClick={() => onEdit(cat)} icon={<EditIcon sx={{ fontSize: 14 }} />} color="#6366f1" />
                    <ActionBtn onClick={() => onDelete(cat.id)} icon={<DeleteIcon sx={{ fontSize: 14 }} />} color="#ef4444" />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Desktop Table */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, borderRadius: '14px', overflow: 'hidden', border: isDark ? '1px solid rgba(99,102,241,0.12)' : '1px solid rgba(99,102,241,0.1)' }}>
        <DataGrid
          rows={filteredCategories}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[8, 16, 32]}
          getRowId={row => row.id}
          disableSelectionOnClick
          autoHeight
          sx={getGridSx(isDark)}
        />
      </Box>
    </Box>
  );
};

export default CategoryTable;