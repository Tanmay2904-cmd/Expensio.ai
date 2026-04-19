import React, { useState, createContext, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CssBaseline,
  IconButton,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  Avatar,
  Chip,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/Sidebar';
import AiChatbot from './components/AiChatbot';

const ColorModeContext = createContext({ toggleColorMode: () => { } });
const drawerWidth = 220;

const ProtectedRoute = ({ children, adminOnly }) => {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const [mobileOpen, setMobileOpen] = useState(false);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light' ? {
            background: {
              default: '#f5f6fa',
              paper: '#ffffff',
            },
          } : {}),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", sans-serif',
        },
      }),
    [mode]
  );

  const { token, role, logout, user } = useAuth();
  const navigate = useNavigate();
  const isDark = mode === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {token && (
            <Sidebar
              drawerWidth={drawerWidth}
              role={role}
              mode={mode}
              mobileOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
            />
          )}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>

            {/* NAVBAR */}
            <AppBar
              position="fixed"
              elevation={0}
              sx={{
                zIndex: (t) => t.zIndex.drawer + 1,
                width: { xs: '100%', md: token ? `calc(100% - ${drawerWidth}px)` : '100%' },
                ml: { xs: 0, md: token ? `${drawerWidth}px` : 0 },
                background: isDark
                  ? 'rgba(8, 8, 24, 0.9)'
                  : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: isDark
                  ? '1px solid rgba(99,102,241,0.15)'
                  : '1px solid rgba(99,102,241,0.1)',
                boxShadow: isDark
                  ? 'none'
                  : '0 1px 12px rgba(99,102,241,0.08)',
              }}
            >
              <Toolbar sx={{ minHeight: 60, px: { xs: 1.5, md: 2.5 }, gap: 1 }}>

                {/* MENU - mobile only */}
                {token && (
                  <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{
                      display: { md: 'none' },
                      color: isDark ? 'rgba(255,255,255,0.8)' : '#6366f1',
                      mr: 0.5,
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}

                {/* LOGO */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    background: isDark
                      ? 'linear-gradient(135deg, #a5b4fc, #c4b5fd)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.01em',
                  }}>
                    Expensio
                  </Typography>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '5px',
                    px: 0.6, py: 0.1,
                  }}>
                    <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>
                      AI
                    </Typography>
                  </Box>
                </Box>

                {/* USER INFO + LOGOUT */}
                {token && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, minWidth: 0 }}>

                    <Avatar sx={{
                      width: 30, height: 30,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {(user || 'U').charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography sx={{
                      maxWidth: { xs: 55, sm: 110 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isDark ? 'rgba(255,255,255,0.85)' : '#374151',
                      display: { xs: 'none', sm: 'block' },
                    }}>
                      {user}
                    </Typography>

                    {role === 'ADMIN' && (
                      <Chip
                        label="Admin"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: 'white',
                          display: { xs: 'none', sm: 'flex' },
                        }}
                      />
                    )}

                    <Button
                      onClick={handleLogout}
                      size="small"
                      variant={isDark ? 'text' : 'outlined'}
                      sx={{
                        flexShrink: 0,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        px: { xs: 1, md: 1.5 },
                        py: 0.4,
                        minWidth: 0,
                        borderRadius: '8px',
                        color: isDark ? 'rgba(255,255,255,0.7)' : '#6366f1',
                        borderColor: isDark ? 'transparent' : 'rgba(99,102,241,0.3)',
                        '&:hover': {
                          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)',
                          borderColor: '#6366f1',
                        },
                      }}
                    >
                      Logout
                    </Button>

                  </Box>
                )}

                {/* DARK MODE TOGGLE */}
                <IconButton
                  onClick={colorMode.toggleColorMode}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.7)' : '#6366f1',
                    background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                    borderRadius: '10px',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)',
                    },
                  }}
                >
                  {mode === 'dark' ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
                </IconButton>

              </Toolbar>
            </AppBar>

            <Toolbar sx={{ minHeight: '60px !important' }} />

            <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
              </Routes>
            </Box>

          </Box>
        </Box>

        <AiChatbot />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;