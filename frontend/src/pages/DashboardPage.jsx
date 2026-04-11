import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Skeleton, useTheme } from '@mui/material';
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
        : 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: isDark
        ? '1px solid rgba(99,102,241,0.2)'
        : '1px solid rgba(99,102,241,0.12)',
      boxShadow: isDark
        ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
        : `0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: isDark
          ? `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${glowColor}`
          : `0 20px 50px rgba(99,102,241,0.15), 0 0 30px ${glowColor}`,
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
    <GlassCard glowColor={`${color}40`} sx={{ animation: `fadeInUp 0.5s ease ${delay}ms both` }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{
          width: 52, height: 52,
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 14px ${color}30`,
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', md: '1.8rem' },
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
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
        background: theme.palette.mode === 'dark' ? 'rgba(13,13,36,0.95)' : 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '12px',
        p: 1.5,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
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

  const totalSpent = pieData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = pieData.length > 0 ? pieData.reduce((a, b) => a.value > b.value ? a : b) : null;
  const maxMonthlySpend = barData.reduce((max, d) => d.total > max ? d.total : max, 0);
  const bestMonth = barData.find(d => d.total === maxMonthlySpend);

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5, animation: 'fadeInUp 0.4s ease both' }}>
        <Typography variant="h4" sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}>
          {role === 'ADMIN' ? '🛡️ System Dashboard' : '👋 Welcome Back'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {role === 'ADMIN' ? 'Monitoring all user expenses across the platform' : 'Here\'s an overview of your financial activity'}
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rounded" height={110} sx={{ borderRadius: '20px' }} /> : (
            <StatCard
              icon={<AccountBalanceWalletIcon />}
              label="Total Spent"
              value={`₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#6366f1"
              subtitle="All categories combined"
              delay={0}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rounded" height={110} sx={{ borderRadius: '20px' }} /> : (
            <StatCard
              icon={<CategoryIcon />}
              label="Top Category"
              value={topCategory ? topCategory.name : '—'}
              color="#8b5cf6"
              subtitle={topCategory ? `₹${topCategory.value.toFixed(2)} spent` : 'No data yet'}
              delay={100}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rounded" height={110} sx={{ borderRadius: '20px' }} /> : (
            <StatCard
              icon={<TrendingUpIcon />}
              label="Peak Month"
              value={bestMonth && bestMonth.total > 0 ? bestMonth.month : '—'}
              color="#06b6d4"
              subtitle={bestMonth && bestMonth.total > 0 ? `₹${bestMonth.total.toFixed(2)} spent` : 'No spending yet'}
              delay={200}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <Skeleton variant="rounded" height={110} sx={{ borderRadius: '20px' }} /> : (
            <StatCard
              icon={<CalendarMonthIcon />}
              label="Active Categories"
              value={pieData.length}
              color="#10b981"
              subtitle="Tracked expense types"
              delay={300}
            />
          )}
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Area / Trend Chart */}
        <Grid item xs={12} md={7}>
          <GlassCard sx={{ height: 360, animation: 'fadeInUp 0.5s ease 150ms both' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              📈 Monthly Spending Trend
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              {role === 'ADMIN' ? 'System-wide expense trend' : 'Your personal expense history'}
            </Typography>
            {loading ? <Skeleton variant="rectangular" height={270} sx={{ borderRadius: 3 }} /> : (
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="80%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#areaGradient)"
                    dot={{ fill: '#6366f1', r: 3.5, strokeWidth: 2, stroke: isDark ? '#0d0d24' : '#fff' }}
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <GlassCard sx={{ height: 360, animation: 'fadeInUp 0.5s ease 250ms both' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              🍩 Category Breakdown
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Spending distribution by category
            </Typography>
            {loading ? <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} /> : (
              pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="43%"
                      outerRadius={95}
                      innerRadius={50}
                      paddingAngle={3}
                      isAnimationActive
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                          style={{ filter: `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]}80)` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 250, gap: 1 }}>
                  <Typography sx={{ fontSize: '2.5rem' }}>💸</Typography>
                  <Typography variant="body2" color="text.secondary">No expense data yet</Typography>
                  <Typography variant="caption" color="text.secondary">Add your first expense to see insights</Typography>
                </Box>
              )
            )}
          </GlassCard>
        </Grid>
      </Grid>

      {/* Bar chart */}
      <GlassCard sx={{ animation: 'fadeInUp 0.5s ease 350ms both' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>📊 Monthly Bar Overview</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          Comparative spending across months
        </Typography>
        {loading ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} /> : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </Box>
  );
};

export default DashboardPage;