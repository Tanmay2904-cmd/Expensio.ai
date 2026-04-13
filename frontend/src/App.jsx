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

const ColorModeContext = createContext({ toggleColorMode: () => {} });
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
      toggleColorMode: () =>
        setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
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

    // ✅ FINAL COLORS
    background: isDark
      ? 'rgba(8, 8, 24, 0.85)'
      : '#ffffff',

    color: isDark ? '#fff' : '#111',

    backdropFilter: isDark ? 'blur(24px)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(24px)' : 'none',

    borderBottom: isDark
      ? '1px solid rgba(99,102,241,0.15)'
      : '1px solid #e5e7eb',
  }}
>
  <Toolbar sx={{ minHeight: 64, px: 2, gap: 1 }}>

    {/* MENU */}
    {token && (
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{ display: { md: 'none' }, color: 'inherit' }}
      >
        <MenuIcon />
      </IconButton>
    )}

    {/* LOGO */}
    <Typography
      sx={{
        flexGrow: 1,
        fontWeight: 800,
        fontSize: '1.1rem',
      }}
    >
      Expensio
    </Typography>

    {/* USER + LOGOUT */}
    {token && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        
        <Avatar sx={{ width: 28, height: 28 }}>
          {(user || 'U').charAt(0).toUpperCase()}
        </Avatar>

        <Typography
          sx={{
            maxWidth: { xs: 60, sm: 120 },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.8rem',
          }}
        >
          {user}
        </Typography>

        <Button
          onClick={handleLogout}
          size="small"
          sx={{
            flexShrink: 0,
            fontSize: '0.75rem',
            color: isDark ? '#fff' : '#ef4444',
          }}
        >
          Logout
        </Button>

      </Box>
    )}

    {/* DARK MODE */}
    <IconButton onClick={colorMode.toggleColorMode} sx={{ color: 'inherit' }}>
      {mode === 'dark' ? <LightMode /> : <DarkMode />}
    </IconButton>

  </Toolbar>
</AppBar>


            <Toolbar />

            <Box sx={{ p: 2 }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                {role === 'ADMIN' && (
                  <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
                )}
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