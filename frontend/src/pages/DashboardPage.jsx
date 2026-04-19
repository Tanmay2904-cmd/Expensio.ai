import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Skeleton, useTheme, Chip } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShieldIcon from '@mui/icons-material/Shield';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#a855f7'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const GlassCard = ({ children, sx = {}, glowColor = 'rgba(99,102,241,0.15)' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper elevation={0} sx={{
      borderRadius: '20px',
      p: { xs: 2, md: 2.5 },
      background: isDark
        ? 'rgba(13, 13, 36, 0.7)'
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: isDark
        ? '1px solid rgba(99,102,241,0.2)'
        : '1px solid rgba(99,102,241,0.1)',
      boxShadow: isDark
        ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
        : `0 4px 24px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: isDark
          ? `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${glowColor}`
          : `0 12px 40px rgba(99,102,241,0.12), 0 0 20px ${glowColor}`,
      },
      ...sx
    }}>
      {children}
    </Paper>
  );
};

const StatCard = ({ icon, label, value, color, subtitle, delay = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <GlassCard glowColor={`${color}40`} sx={{ animation: `fadeInUp 0.5s ease ${delay}ms both`, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{
          width: 48, height: 48,
          borderRadius: '14px',
          background: isDark ? `linear-gradient(135deg, ${color}22, ${color}11)` : `linear-gradient(135deg, ${color}18, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 14px ${color}25`,
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{
            color: 'text.secondary', fontWeight: 600, mb: 0.5,
            fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em'
          }}>
            {label}
          </Typography>
          <Typography sx={{
            fontWeight: 800,
            fontSize: { xs: '1.35rem', md: '1.6rem' },
            background: `linear-gradient(135deg, ${color}, ${color}bb)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.15,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.4, display: 'block', fontSize: '0.72rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </GlassCard>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        background: theme.palette.mode === 'dark' ? 'rgba(13,13,36,0.95)' : 'rgba(255,255,255,0.98)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '12px',
        p: 1.5,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}>
        {label && <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>}
        {payload.map((p, i) => (
          <Typography key={i} sx={{ fontSize: '0.9rem', fontWeight: 700, color: p.color || p.fill }}>
            ₹{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const DashboardPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { role } = useAuth();
  const [barData, setBarData] = useState(MONTHS.map(month => ({ month, total: 0 })));
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extra stats
  const totalSpent = pieData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = pieData.length > 0 ? pieData.reduce((a, b) => a.value > b.value ? a : b) : null;
  const maxMonthlySpend = barData.reduce((max, d) => d.total > max ? d.total : max, 0);
  const bestMonth = barData.find(d => d.total === maxMonthlySpend);
  const activeDays = barData.filter(d => d.total > 0).length;
  const avgDaily = activeDays > 0 ? totalSpent / activeDays : 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let monthlyRes, categoryRes;
        if (role === 'ADMIN') {
          [monthlyRes, categoryRes] = await Promise.all([
            axiosInstance.get('/api/expenses/admin/monthly-summary'),
            axiosInstance.get('/api/expenses/admin/total-by-category')
          ]);
        } else {
          [monthlyRes, categoryRes] = await Promise.all([
            axiosInstance.get('/api/expenses/my/monthly-summary'),
            axiosInstance.get('/api/expenses/my/total-by-category')
          ]);
        }
        const apiMonthlyData = monthlyRes.data || {};
        setBarData(MONTHS.map(month => ({ month, total: apiMonthlyData[month] || 0 })));
        const apiCategoryData = categoryRes.data || {};
        setPieData(Object.entries(apiCategoryData).map(([name, value]) => ({ name, value: parseFloat(value) })));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setBarData(MONTHS.map(month => ({ month, total: 0 })));
        setPieData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [role]);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{
        mb: 3,
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
        border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          {role === 'ADMIN' && <ShieldIcon sx={{ color: '#6366f1', fontSize: 28 }} />}
          <Typography variant="h5" sx={{
            fontWeight: 800,
            fontSize: { xs: '1.4rem', md: '1.8rem' },
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            {role === 'ADMIN' ? 'System Dashboard' : 'Welcome Back'}
          </Typography>
          {role === 'ADMIN' && (
            <Chip label="Admin" size="small" sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontWeight: 700, fontSize: '0.65rem', height: 20,
            }} />
          )}
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
          {role === 'ADMIN' ? 'Monitoring all user expenses across the platform' : "Here's an overview of your financial activity"}
        </Typography>
      </Box>

      {/* Stat Cards - 2 columns on mobile, 4 on desktop */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <AccountBalanceWalletIcon />, label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#6366f1', subtitle: 'All categories combined', delay: 0 },
          { icon: <CategoryIcon />, label: 'Top Category', value: topCategory ? topCategory.name : '—', color: '#8b5cf6', subtitle: topCategory ? `₹${topCategory.value.toFixed(2)} spent` : 'No data yet', delay: 100 },
          { icon: <TrendingUpIcon />, label: 'Peak Month', value: bestMonth && bestMonth.total > 0 ? bestMonth.month : '—', color: '#06b6d4', subtitle: bestMonth && bestMonth.total > 0 ? `₹${bestMonth.total.toFixed(2)} spent` : 'No spending yet', delay: 200 },
          { icon: <CalendarMonthIcon />, label: 'Active Categories', value: pieData.length, color: '#10b981', subtitle: 'Tracked expense types', delay: 300 },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            {loading
              ? <Skeleton variant="rounded" height={100} sx={{ borderRadius: '20px' }} />
              : <StatCard {...stat} />
            }
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Area Chart */}
        <Grid item xs={12} md={7}>
          <GlassCard sx={{ height: { xs: 300, md: 360 }, width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ShowChartIcon sx={{ fontSize: 18, color: '#6366f1' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                Monthly Spending Trend
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              {role === 'ADMIN' ? 'System-wide expense trend' : 'Your personal expense history'}
            </Typography>
            {loading
              ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
              : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={barData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="80%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGradient)"
                      dot={{ fill: '#6366f1', r: 3, strokeWidth: 2, stroke: isDark ? '#0d0d24' : '#fff' }}
                      activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </GlassCard>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <GlassCard sx={{ height: { xs: 300, md: 360 }, width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <DonutLargeIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                Category Breakdown
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Spending distribution by category
            </Typography>
            {loading
              ? <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto', mt: 3 }} />
              : pieData.length > 0
                ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="42%"
                        outerRadius={85} innerRadius={45} paddingAngle={3} isAnimationActive>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none"
                            style={{ filter: `drop-shadow(0 0 5px ${COLORS[index % COLORS.length]}70)` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={7}
                        formatter={(value) => <span style={{ fontSize: '0.72rem', color: theme.palette.text.secondary }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )
                : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, gap: 1.5 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>No expense data yet</Typography>
                    <Typography variant="caption" color="text.secondary">Add your first expense to see insights</Typography>
                  </Box>
                )
            }
          </GlassCard>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <GlassCard>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <BarChartIcon sx={{ fontSize: 18, color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Monthly Bar Overview
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          Comparative spending across months
        </Typography>
        {loading
          ? <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
          : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          )}
      </GlassCard>
    </Box>
  );
};

export default DashboardPage;