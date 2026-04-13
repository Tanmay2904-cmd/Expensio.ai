import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  IconButton,
  Box,
  TextField,
  InputAdornment,
  useTheme,
  Chip,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const getGridSx = (isDark) => ({
  border: 0,
  fontFamily: '"Inter", "Space Grotesk", sans-serif',
  fontSize: '0.875rem',
  '& .MuiDataGrid-columnHeaders': {
    background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
  },
});

const SearchBar = ({ value, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <TextField
      size="small"
      value={value}
      onChange={onChange}
      placeholder="Search expenses..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 18 }} />
          </InputAdornment>
        ),
      }}
      sx={{
        width: { xs: '100%', sm: 260 },
        background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
        borderRadius: '10px',
      }}
    />
  );
};

const ActionBtn = ({ onClick, icon, color }) => (
  <IconButton
    onClick={onClick}
    size="small"
    sx={{
      width: 30,
      height: 30,
      background: `${color}20`,
      color,
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
    return expenses.filter((row) =>
      row.description?.toLowerCase().includes(lower)
    );
  }, [search, expenses]);

  const columns = [
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: ({ value }) => `₹${value}`,
    },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      renderCell: ({ row }) => (
        <>
          <ActionBtn
            onClick={() => onEdit(row)}
            icon={<EditIcon />}
            color="#6366f1"
          />
          <ActionBtn
            onClick={() => onDelete(row.id)}
            icon={<DeleteIcon />}
            color="#ef4444"
          />
        </>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* SEARCH */}
      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>

      {/* MOBILE VIEW */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredExpenses.map((row) => (
          <Box
            key={row.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '12px',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <Typography fontWeight={700}>
              ₹{row.amount}
            </Typography>
            <Typography>{row.description}</Typography>
            <Typography variant="caption">{row.date}</Typography>

            <Box sx={{ mt: 1 }}>
              <ActionBtn onClick={() => onEdit(row)} icon={<EditIcon />} color="#6366f1" />
              <ActionBtn onClick={() => onDelete(row.id)} icon={<DeleteIcon />} color="#ef4444" />
            </Box>
          </Box>
        ))}
      </Box>

      {/* DESKTOP TABLE */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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