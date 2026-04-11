import React, { useState, createContext, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
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
  Logout,
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
  const location = useLocation();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
    }),
    []
  );

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#8b5cf6',
        light: '#a78bfa',
        dark: '#7c3aed',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#080818' : '#f0f2ff',
        paper: mode === 'dark' ? '#0d0d24' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#06b6d4' },
    },
    typography: {
      fontFamily: '"Inter", "Space Grotesk", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
      body1: { lineHeight: 1.7 },
      body2: { lineHeight: 1.6 },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #080818 0%, #0d0d24 40%, #0f0f2e 100%)'
              : 'linear-gradient(135deg, #f0f2ff 0%, #e8eaff 50%, #f5f0ff 100%)',
            backgroundAttachment: 'fixed',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(99,102,241,0.25)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          },
          outlined: {
            borderColor: 'rgba(99,102,241,0.4)',
            '&:hover': {
              borderColor: '#6366f1',
              background: 'rgba(99,102,241,0.06)',
            }
          }
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s ease',
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
              }
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          }
        }
      }
    },
  }), [mode]);

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
        {/* Background ambient orbs */}
        <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <Box className="bg-orb bg-orb-1" />
          <Box className="bg-orb bg-orb-2" />
          <Box className="bg-orb bg-orb-3" />
        </Box>
        <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          {token && <Sidebar drawerWidth={drawerWidth} role={role} mode={mode} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />}
          <Box sx={{
            flexGrow: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
            {/* Top AppBar */}
            <AppBar position="fixed" elevation={0} sx={{
              zIndex: (t) => t.zIndex.drawer + 1,
              width: { xs: '100%', md: token ? `calc(100% - ${drawerWidth}px)` : '100%' },
              ml: { xs: 0, md: token ? `${drawerWidth}px` : 0 },
              background: isDark ? 'rgba(8, 8, 24, 0.85)' : 'rgba(240, 242, 255, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.12)',
            }}>
              <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 2 }, gap: 1.5 }}>
                {/* Hamburger for mobile */}
                {token && (
                  <IconButton
                    onClick={() => setMobileOpen(true)}
                    size="small"
                    sx={{
                      display: { md: 'none' },
                      color: isDark ? '#a5b4fc' : '#6366f1',
                      mr: 0.5,
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                {/* Brand / Page indicator */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.01em',
                  }}>
                    Expensio
                  </Typography>
                  {token && role === 'ADMIN' && (
                    <Chip
                      label="Admin"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#818cf8',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                      }}
                    />
                  )}
                </Box>

                {/* User info */}
                {token && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                    borderRadius: 3, px: 1.5, py: 0.75,
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)',
                  }}>
                    <Avatar sx={{
                      width: 30, height: 30, fontSize: 13,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                    }}>
                      {(user || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{
                      fontWeight: 600, fontSize: '0.8rem',
                      color: isDark ? '#e2e8f0' : '#4338ca',
                      display: { xs: 'none', sm: 'block' }
                    }}>
                      {user}
                    </Typography>
                  </Box>
                )}

                {/* Dark mode toggle */}
                <IconButton
                  onClick={colorMode.toggleColorMode}
                  size="small"
                  sx={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.15)',
                    borderRadius: '10px',
                    width: 38, height: 38,
                    color: isDark ? '#818cf8' : '#6366f1',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.15)',
                      transform: 'rotate(15deg)',
                    }
                  }}
                >
                  {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>

                {/* Logout */}
                {token && (
                  <Button
                    onClick={handleLogout}
                    startIcon={<Logout fontSize="small" />}
                    size="small"
                    sx={{
                      background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171',
                      borderRadius: '10px',
                      px: 1.5, py: 0.75,
                      fontSize: '0.8rem',
                      '&:hover': {
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Logout
                  </Button>
                )}
              </Toolbar>
            </AppBar>

            {/* Page content */}
            <Toolbar />
            <Box sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 } }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                {role === 'ADMIN' && (
                  <Route path="/users" element={<ProtectedRoute adminOnly={true}><UsersPage /></ProtectedRoute>} />
                )}
              </Routes>
            </Box>

            {/* Footer only on login */}
            {location.pathname === '/login' && (
              <Box component="footer" sx={{
                py: 2.5, textAlign: 'center',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(99,102,241,0.1)',
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  © {new Date().getFullYear()} Expensio 
                </Typography>
              </Box>
            )}
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
