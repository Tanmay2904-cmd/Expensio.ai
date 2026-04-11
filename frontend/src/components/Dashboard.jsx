import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import axiosInstance from '../utils/axiosConfig';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6699', '#33CC99'];

const Dashboard = () => {
  const { role } = useAuth();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
      const categoryData = Object.entries(catRes.data).map(([name, value]) => ({ name, value }));
      setCategoryData(categoryData);
      const monthlyData = Object.entries(monRes.data).map(([month, value]) => ({ month, value }));
      setMonthlyData(monthlyData);
    };
    fetchData();
  }, [role]);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 4 }}>
      <Paper sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ flex: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>Monthly Expense Trend</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard; 