import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  CircularProgress, 
  Alert, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5a2b'];

const ReportsPage = () => {
  const { role } = useAuth();
  const theme = useTheme();
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  // Generate last 12 months for dropdown
  const getLast12Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value, label });
    }
    return months;
  };

  useEffect(() => {
    if (role === 'ADMIN') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/reports/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { yearMonth };
      if (role === 'ADMIN' && selectedUserId) {
        params.userId = selectedUserId;
      }
      
      const response = await axios.get('/api/reports/monthly', { params });
      setReport(response.data);
    } catch (err) {
      setError('Failed to fetch report. Please try again.');
      console.error('Report fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${report.period.yearMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    if (!report) return '';
    
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = report.allExpenses.map(exp => [
      exp.date,
      exp.description,
      exp.category,
      exp.amount
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: { xs: 2, md: 4 }, 
      px: { xs: 1, md: 3 },
      width: '100%', // Fix here
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <Grid container justifyContent="center" sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: 4,
            width: '100%',
            maxWidth: '100%',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 15, 35, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              pb: 2,
              borderBottom: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h4" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 1
              }}>
                <AssessmentIcon sx={{ fontSize: 32 }} />
                Monthly Expense Report
              </Typography>
              {report && (
                <Tooltip title="Export to CSV">
                  <IconButton 
                    onClick={exportReport} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Filters - Always Visible */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3, 
              mb: 4, 
              p: 3, 
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(99, 102, 241, 0.05)',
              borderRadius: 3,
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(99, 102, 241, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <TextField
                select
                label="Month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                size="small"
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 1)',
                    }
                  }
                }}
              >
                {getLast12Months().map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
              
              {role === 'ADMIN' && (
                <TextField
                  select
                  label="User"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  size="small"
                  sx={{ 
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 0.9)',
                      },
                      '&.Mui-focused': {
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 1)',
                      }
                    }
                  }}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              
              <Button 
                variant="contained" 
                onClick={fetchReport} 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                sx={{ 
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ 
                mb: 3, 
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.05)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </Alert>
            )}

            {report && (
            <Box>
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(99, 102, 241, 0.2)'
                        : '1px solid rgba(99, 102, 241, 0.1)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 1, 
                          fontWeight: 700,
                          color: theme.palette.text.primary
                        }}>
                          Total Spent
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {formatCurrency(report.summary.totalAmount)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(16, 185, 129, 0.2)'
                        : '1px solid rgba(16, 185, 129, 0.1)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 1, 
                          fontWeight: 700,
                          color: theme.palette.text.primary
                        }}>
                          Total Expenses
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 800,
                          color: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                        }}>
                          {report.summary.totalCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(245, 158, 11, 0.2)'
                        : '1px solid rgba(245, 158, 11, 0.1)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 1, 
                          fontWeight: 700,
                          color: theme.palette.text.primary
                        }}>
                          Average Daily
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 800,
                          color: theme.palette.mode === 'dark' ? '#f59e0b' : '#d97706',
                        }}>
                          {formatCurrency(report.summary.averageDailySpending)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(236, 72, 153, 0.2)'
                        : '1px solid rgba(236, 72, 153, 0.1)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 1, 
                          fontWeight: 700,
                          color: theme.palette.text.primary
                        }}>
                          Days with Expenses
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 800,
                          color: theme.palette.mode === 'dark' ? '#ec4899' : '#db2777',
                        }}>
                          {report.summary.daysWithExpenses}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        fontWeight: 700,
                        textAlign: 'center',
                        color: theme.palette.text.primary
                      }}>
                        Category Breakdown
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(report.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={50}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {Object.entries(report.categoryBreakdown).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              background: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
                              color: theme.palette.text.primary,
                              borderRadius: 12,
                              border: theme.palette.mode === 'dark' 
                                ? '1px solid rgba(255, 255, 255, 0.1)' 
                                : '1px solid rgba(0, 0, 0, 0.1)',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                      }
                    }}>
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        fontWeight: 700,
                        textAlign: 'center',
                        color: theme.palette.text.primary
                      }}>
                        Daily Spending Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={Object.entries(report.dailyBreakdown).map(([date, amount]) => ({ date, amount }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="date" stroke={theme.palette.text.primary} />
                          <YAxis stroke={theme.palette.text.primary} />
                          <RechartsTooltip
                            contentStyle={{
                              background: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
                              color: theme.palette.text.primary,
                              borderRadius: 12,
                              border: theme.palette.mode === 'dark' 
                                ? '1px solid rgba(255, 255, 255, 0.1)' 
                                : '1px solid rgba(0, 0, 0, 0.1)',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                            }}
                          />
                          <Bar dataKey="amount" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Top Expenses Table */}
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    color: theme.palette.text.primary
                  }}>
                    Top 5 Expenses
                  </Typography>
                  <Table>
                  <TableHead>
                      <TableRow sx={{ 
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                      }}>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      {report.topExpenses.map((expense, index) => (
                        <TableRow key={expense.id} sx={{ 
                          '&:nth-of-type(even)': {
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.01)'
                              : 'rgba(0, 0, 0, 0.01)',
                          },
                          '&:hover': {
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.02)'
                              : 'rgba(99, 102, 241, 0.02)',
                          }
                        }}>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {expense.description}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={expense.category} 
                              size="small"
                              sx={{ 
                                background: theme.palette.mode === 'dark' 
                                  ? 'rgba(99, 102, 241, 0.2)' 
                                  : 'rgba(99, 102, 241, 0.1)',
                                color: theme.palette.mode === 'dark' ? '#818cf8' : '#6366f1',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            fontWeight: 700,
                            color: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
                          }}>
                            {formatCurrency(expense.amount)}
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage; 