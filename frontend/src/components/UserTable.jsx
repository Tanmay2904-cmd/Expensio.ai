import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, TextField, InputAdornment, useTheme, Chip, Typography, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const getGridSx = (isDark) => ({
  border: 0,
  fontFamily: '"Inter", "Space Grotesk", sans-serif',
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

const UserTable = ({ users, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(u => u.name?.toLowerCase().includes(lower) || u.role?.toLowerCase().includes(lower));
  }, [search, users]);

  const columns = [
    {
      field: 'name', headerName: 'Username', flex: 1, minWidth: 180, sortable: true,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar sx={{
            width: 30, height: 30, fontSize: '0.75rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>
            {(value || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{value}</Typography>
        </Box>
      )
    },
    {
      field: 'role', headerName: 'Role', width: 120, sortable: true,
      align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            background: value === 'ADMIN'
              ? isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)'
              : isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)',
            border: value === 'ADMIN' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
            color: value === 'ADMIN' ? (isDark ? '#f87171' : '#dc2626') : (isDark ? '#34d399' : '#059669'),
            fontWeight: 700, fontSize: '0.68rem', height: 22, letterSpacing: '0.05em',
          }}
        />
      )
    },
    {
      field: 'actions', headerName: '', width: 90, sortable: false, filterable: false,
      align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.7 }}>
          <ActionBtn onClick={() => onEdit(row)} icon={<EditIcon sx={{ fontSize: 15 }} />} color="#6366f1" />
          <ActionBtn onClick={() => onDelete(row.id)} icon={<DeleteIcon sx={{ fontSize: 15 }} />} color="#ef4444" />
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
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
          sx={{ width: { xs: '100%', sm: 240 } }}
        />
      </Box>

      <Box sx={{
        borderRadius: '14px', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%',
        border: isDark ? '1px solid rgba(99,102,241,0.12)' : '1px solid rgba(99,102,241,0.1)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(99,102,241,0.06)',
      }}>
        <DataGrid
          rows={filteredUsers}
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

export default UserTable;