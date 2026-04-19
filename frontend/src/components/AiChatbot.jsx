import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Fab, CircularProgress, Divider, useTheme, Tooltip } from '@mui/material';
import { Close, Send } from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const AiChatbot = () => {
    const { token } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'AI', text: "Hi! 👋 I'm your Expensio AI assistant." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (!token) return null;

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { sender: 'User', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await axiosInstance.post('/api/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { sender: 'AI', text: res.data.reply || 'No response' }]);
        } catch {
            setMessages(prev => [...prev, { sender: 'AI', text: "Error connecting to AI" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
            {/* CHAT BOX */}
            {open && (
                <Paper sx={{
                    width: 370,
                    height: 520,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        p: 2
                    }}>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                            Expensio AI
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {messages.map((m, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex',
                                    justifyContent: m.sender === 'User' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <Box sx={{
                                    maxWidth: '80%',
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: m.sender === 'User'
                                        ? '16px 16px 4px 16px'
                                        : '16px 16px 16px 4px',
                                    background: m.sender === 'User'
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.07)',
                                    color: m.sender === 'User'
                                        ? '#fff'
                                        : 'text.primary',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    boxShadow: m.sender === 'User'
                                        ? '0 2px 8px rgba(99,102,241,0.3)'
                                        : '0 1px 4px rgba(0,0,0,0.08)',
                                }}>
                                    {m.text}
                                </Box>
                            </Box>
                        ))}
                        {loading && <CircularProgress size={20} sx={{ alignSelf: 'flex-start', ml: 1 }} />}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{ p: 1, display: 'flex', gap: 0.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask me about your finances..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <IconButton onClick={handleSend} disabled={loading} sx={{ color: 'text.primary' }}>
                            <Send />
                        </IconButton>
                    </Box>
                </Paper>
            )}

            {/* FAB BUTTON - ✅ FIXED CLOSE ICON VISIBILITY */}
            <Tooltip title="AI Assistant">
                <Fab
                    onClick={() => setOpen(!open)}
                    sx={{
                        background: 'transparent',
                        boxShadow: 'none',
                        width: 60,
                        height: 60,
                        minHeight: 'auto',
                        color: 'text.primary', // ✅ KEY FIX: Theme-aware color
                        '&:hover': {
                            background: 'transparent',
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    {open ? <Close fontSize="small" /> : (
                        // 🔥 BIG LOGO FULL BUTTON
                        <svg width="60" height="60" viewBox="0 0 64 64">
                            <defs>
                                <linearGradient id="g" x1="0" y1="0" x2="64" y2="64">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" />
                                </filter>
                            </defs>
                            <rect
                                x="2" y="4" width="60" height="56" rx="22"
                                fill="url(#g)"
                                filter="url(#glow)"
                            />
                            <text
                                x="32"
                                y="36"
                                fontFamily="'Inter',sans-serif"
                                fontSize="22"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                            >
                                Ex.ai
                            </text>
                        </svg>
                    )}
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default AiChatbot;