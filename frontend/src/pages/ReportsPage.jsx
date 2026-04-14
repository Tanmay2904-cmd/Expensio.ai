import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Button,
  CircularProgress, Alert, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Tooltip, useTheme
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RT, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download as DownloadIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#a855f7'];

const GlassCard = ({ children, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper elevation={0} sx={{
      borderRadius: '20px', p: { xs: 2, md: 2.5 },
      background: isDark ? 'rgba(13,13,36,0.7)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      border: isDark ? '1px solid rgba(99,102,241,0.18)' : '1px solid rgba(99,102,241,0.1)',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(99,102,241,0.08)',
      ...sx
    }}>
      {children}
    </Paper>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: isDark ? 'rgba(13,13,36,0.95)' : 'rgba(255,255,255,0.97)',
      border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px',
      p: 1.5, backdropFilter: 'blur(12px)',
    }}>
      {label && <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>}
      {payload.map((p, i) => (
        <Typography key={i} sx={{ fontSize: '0.9rem', fontWeight: 700, color: p.color || p.fill }}>
          ₹{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ))}
    </Box>
  );
};

const StatMiniCard = ({ label, value, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper elevation={0} sx={{
      borderRadius: '16px', p: { xs: 1.5, md: 2.5 }, textAlign: 'center',
      background: isDark ? `rgba(${color}, 0.08)` : `rgba(${color}, 0.05)`,
      border: `1px solid rgba(${color}, 0.2)`,
      transition: 'transform 0.25s ease',
      '&:hover': { transform: 'translateY(-3px)' }
    }}>
      <Typography variant="caption" sx={{
        color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', display: 'block', mb: 0.75,
        fontSize: { xs: '0.65rem', md: '0.72rem' }
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontWeight: 800, color: `rgb(${color})`,
        fontSize: { xs: '1rem', md: '1.4rem' },
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </Typography>
    </Paper>
  );
};

const getCurrentYearMonth = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getLast12Months = () => {
  const months = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  for (let i = 0; i < 12; i++) {
    let y = year;
    let m = month - i;
    while (m < 0) { m += 12; y -= 1; }
    const value = `${y}-${String(m + 1).padStart(2, '0')}`;
    const label = new Date(y, m, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    months.push({ value, label });
  }
  return months;
};

const ReportsPage = () => {
  const { role } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  React.useEffect(() => {
    if (role === 'ADMIN') axiosInstance.get('/api/reports/users').then(r => setUsers(r.data)).catch(() => { });
  }, [role]);

  const fetchReport = async () => {
    setLoading(true); setError('');
    try {
      const params = { yearMonth };
      if (role === 'ADMIN' && selectedUserId) params.userId = selectedUserId;
      const res = await axiosInstance.get('/api/reports/monthly', { params });
      setReport(res.data);
    } catch { setError('Failed to fetch report. Please try again.'); }
    finally { setLoading(false); }
  };

  const exportReport = () => {
    if (!report) return;
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = report.allExpenses.map(e => [e.date, e.description, e.category, e.amount]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `expense-report-${report.period.yearMonth}.csv`;
    a.click();
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.03)',
      '& fieldset': { borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{
        mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: '20px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
        border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography variant="h5" sx={{
            fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5,
            fontSize: { xs: '1.4rem', md: '1.8rem' },
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Monthly Reports
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            Generate and export your expense reports
          </Typography>
        </Box>
        {report && (
          <Tooltip title="Export CSV">
            <IconButton onClick={exportReport} sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', borderRadius: '12px', width: 44, height: 44,
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', transform: 'scale(1.08)' },
            }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Filters */}
      <GlassCard sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <TextField select label="Month" value={yearMonth} onChange={e => setYearMonth(e.target.value)} size="small"
            sx={{ minWidth: { xs: '100%', sm: 200 }, ...inputSx }}>
            {getLast12Months().map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>
          {role === 'ADMIN' && (
            <TextField select label="User" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} size="small"
              sx={{ minWidth: { xs: '100%', sm: 180 }, ...inputSx }}>
              <MenuItem value="">All Users</MenuItem>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </TextField>
          )}
          <Button variant="contained" onClick={fetchReport} disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AssessmentIcon fontSize="small" />}
            sx={{
              fontWeight: 700, borderRadius: '10px', px: 3, py: 1.1,
              width: { xs: '100%', sm: 'auto' },
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', transform: 'translateY(-1px)' }
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </GlassCard>

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</Alert>}

      {!report && !loading && (
        <GlassCard sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>No Report Generated</Typography>
          <Typography variant="body2" color="text.secondary">Select a month and click Generate Report</Typography>
        </GlassCard>
      )}

      {report && (
        <Box>
          {/* Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {[
              { label: 'Total Spent', value: fmt(report.summary.totalAmount), color: '99,102,241' },
              { label: 'Transactions', value: report.summary.totalCount, color: '16,185,129' },
              { label: 'Avg Daily', value: fmt(report.summary.averageDailySpending), color: '245,158,11' },
              { label: 'Days Active', value: report.summary.daysWithExpenses, color: '236,72,153' },
            ].map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <StatMiniCard {...s} />
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={5}>
              <GlassCard sx={{ height: { xs: 'auto', md: 340 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Category Breakdown</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={Object.entries(report.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                      dataKey="value" nameKey="name" cx="50%" cy="45%"
                      outerRadius={90} innerRadius={45} paddingAngle={3}
                    >
                      {Object.entries(report.categoryBreakdown).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none"
                          style={{ filter: `drop-shadow(0 0 5px ${COLORS[i % COLORS.length]}80)` }} />
                      ))}
                    </Pie>
                    <RT content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={7}
                      formatter={(value) => <span style={{ fontSize: '0.72rem', color: theme.palette.text.secondary }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </GlassCard>
            </Grid>
            <Grid item xs={12} md={7}>
              <GlassCard sx={{ height: { xs: 'auto', md: 340 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Daily Spending</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={Object.entries(report.dailyBreakdown).map(([date, amount]) => ({ date, amount }))}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="rptBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={45} />
                    <RT content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="url(#rptBar)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </Grid>
          </Grid>

          {/* Top Expenses Table */}
          <GlassCard>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top 5 Expenses</Typography>
            <Box sx={{
              borderRadius: '12px',
              overflow: 'auto',
              border: isDark ? '1px solid rgba(99,102,241,0.12)' : '1px solid rgba(99,102,241,0.1)',
            }}>
              <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow sx={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}>
                    {['Date', 'Description', 'Category', 'Amount'].map(h => (
                      <TableCell key={h} sx={{
                        fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: isDark ? '#a5b4fc' : '#6366f1',
                        py: 1.5, whiteSpace: 'nowrap',
                      }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report.topExpenses || []).map((exp, i) => (
                    <TableRow key={i} sx={{ '&:hover': { background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)' } }}>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', py: 1.5, whiteSpace: 'nowrap' }}>{fmtDate(exp.date)}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{exp.description}</TableCell>
                      <TableCell>
                        <Chip label={exp.category} size="small" sx={{
                          background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.25)',
                          color: isDark ? '#a5b4fc' : '#4f46e5',
                          fontWeight: 600, fontSize: '0.7rem', height: 22,
                        }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(exp.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </GlassCard>
        </Box>
      )}
    </Box>
  );
};

export default ReportsPage;