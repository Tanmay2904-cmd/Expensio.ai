import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, useTheme, Typography, Divider, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Expenses', icon: <AccountBalanceWalletIcon />, path: '/expenses' },
  { label: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { label: 'Users', icon: <PeopleIcon />, path: '/users' },
];

const Sidebar = ({ drawerWidth, role, mode, mobileOpen, onClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredNavItems = navItems.filter(item => {
    if (item.path === '/users' && role !== 'ADMIN') return false;
    return true;
  });

  const paperSx = {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: isDark ? 'rgba(8, 8, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.1)',
    boxShadow: isDark ? '4px 0 30px rgba(0,0,0,0.4)' : '4px 0 30px rgba(99,102,241,0.08)',
    overflowX: 'hidden',
  };

  const DrawerContent = (
    <>
      {/* Logo section */}
      <Toolbar sx={{ minHeight: 64, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="Expensio Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </Box>
          <Box>
            <Typography sx={{
              fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}>
              Expensio
            </Typography>
            <Typography sx={{
              fontSize: '0.6rem', color: 'text.secondary', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              AI Finance Tracker
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', mx: 2 }} />

      {/* Nav label */}
      <Typography sx={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'text.secondary',
        px: 2.5, pt: 2, pb: 1,
      }}>
        Navigation
      </Typography>

      {/* Nav items */}
      <List sx={{ px: 1, pt: 0, pb: 2 }}>
        {filteredNavItems.map(item => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.label}
              component={Link}
              to={item.path}
              selected={selected}
              onClick={isMobile ? onClose : undefined}
              sx={{
                mb: 0.4, borderRadius: '10px', px: 1.5, py: 1,
                position: 'relative', overflow: 'hidden',
                background: selected
                  ? isDark
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)'
                  : 'transparent',
                border: selected
                  ? isDark ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.2)'
                  : '1px solid transparent',
                boxShadow: selected ? '0 4px 14px rgba(99,102,241,0.15)' : 'none',
                color: selected ? (isDark ? '#a5b4fc' : '#4f46e5') : theme.palette.text.secondary,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                  color: isDark ? '#a5b4fc' : '#4f46e5',
                  transform: 'translateX(3px)',
                  border: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.12)',
                },
                '&::before': selected ? {
                  content: '""', position: 'absolute',
                  left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.8)',
                } : {},
              }}
            >
              <ListItemIcon sx={{
                color: selected ? (isDark ? '#a5b4fc' : '#6366f1') : theme.palette.text.secondary,
                minWidth: 34, transition: 'color 0.2s',
                '& svg': { fontSize: 20 },
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem', fontWeight: selected ? 700 : 500, letterSpacing: '-0.005em',
                }
              }} />
              {selected && (
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.7)', flexShrink: 0,
                }} />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile: Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: { ...paperSx },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* Desktop: Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .MuiDrawer-paper`]: { ...paperSx },
        }}
        open
      >
        {DrawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;