import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import axiosInstance from '../utils/axiosConfig';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const Dashboard = () => {
  const { role } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let categoryUrl = '/api/expenses/total-by-category';
        let monthlyUrl = '/api/expenses/monthly-summary';
        if (role !== 'ADMIN') {
          categoryUrl = '/api/expenses/my/total-by-category';
          monthlyUrl = '/api/expenses/my/monthly-summary';
        }
        const [catRes, monRes] = await Promise.all([
          axiosInstance.get(categoryUrl),
          axiosInstance.get(monthlyUrl),
        ]);
        setCategoryData(Object.entries(catRes.data).map(([name, value]) => ({ name, value })));
        setMonthlyData(Object.entries(monRes.data).map(([month, value]) => ({ month, value })));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchData();
  }, [role]);

  const cardSx = {
    p: { xs: 2, md: 3 },
    borderRadius: '16px',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.1)',
    boxShadow: isDark ? 'none' : '0 2px 16px rgba(99,102,241,0.07)',
    width: '100%',
    overflow: 'hidden',
  };

  // ✅ Custom legend that wraps properly on mobile
  const renderCustomLegend = () => (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 16px',
      justifyContent: 'center',
      mt: 1,
      px: 1,
    }}>
      {categoryData.map((entry, index) => (
        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{
            width: 10, height: 10, borderRadius: '50%',
            background: COLORS[index % COLORS.length],
            flexShrink: 0,
          }} />
          <Typography sx={{
            fontSize: '0.75rem',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}>
            {entry.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  // ✅ Shorter month labels for mobile
  const formatMonth = (month) => {
    if (!month) return '';
    const parts = month.toString().split('-');
    if (parts.length === 2) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const m = parseInt(parts[1], 10);
      return months[m - 1] || month;
    }
    return month.toString().substring(0, 3);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2.5, md: 3 },
      mt: { xs: 2, md: 4 },
      width: '100%',
    }}>

      {/* Monthly Trend Card */}
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUpIcon sx={{ color: '#6366f1', fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Monthly Spending Trend
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {role === 'ADMIN' ? 'System-wide expense trend' : 'Your expense trend'}
            </Typography>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1e1b4b' : '#fff',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Category Breakdown Card */}
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DonutLargeIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Category Breakdown
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Spending distribution by category
            </Typography>
          </Box>
        </Box>

        {/* ✅ Pie chart with fixed height + custom legend below */}
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: isDark ? '#1e1b4b' : '#fff',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* ✅ Custom wrapping legend — no cutoff on mobile */}
        {renderCustomLegend()}
      </Paper>

    </Box>
  );
};

export default Dashboard;