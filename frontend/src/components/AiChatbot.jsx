import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Fab, CircularProgress, Divider, useTheme, Tooltip } from '@mui/material';
import { Close, Send, AutoAwesome } from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const AiChatbot = () => {
    const { token } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'AI', text: "Hi! I'm your Expensio AI assistant. Ask me anything about your finances." }
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
        <Box sx={{ position: 'fixed', bottom: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 1300 }}>
            {/* CHAT BOX */}
            {open && (
                <Paper sx={{
                    width: { xs: 'calc(100vw - 32px)', sm: 370 },
                    height: { xs: 'calc(100vh - 120px)', sm: 520 },
                    maxHeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        p: 1.5,
                        px: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                            Expensio AI
                        </Typography>
                        <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
                            <Close fontSize="small" />
                        </IconButton>
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

                    <Box sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                        background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)'
                    }}>
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
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '24px' }
                            }}
                        />
                        <IconButton onClick={handleSend} disabled={loading} sx={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            width: 40, height: 40,
                            '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', transform: 'scale(1.05)' },
                            '&:disabled': { background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: 'text.disabled' }
                        }}>
                            <Send fontSize="small" sx={{ ml: 0.5 }} />
                        </IconButton>
                    </Box>
                </Paper>
            )}

            {/* FAB BUTTON */}
            {!open && (
                <Tooltip title="AI Assistant" placement="left">
                    <Fab
                        onClick={() => setOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#ffffff',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                            width: 60, height: 60,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                transform: 'scale(1.05)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <AutoAwesome sx={{ fontSize: 28 }} />
                    </Fab>
                </Tooltip>
            )}
        </Box>
    );
};

export default AiChatbot;