import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { ADMIN_PASSWORD, JWT_SECRET } from '../config/supabase.js';

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de tentatives de connexion',
});

router.post('/login', loginLimiter, (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Mot de passe incorrect' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

router.get('/me', (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) return res.json({ isAuthenticated: false });

    try {
        jwt.verify(token, JWT_SECRET);
        res.json({ isAuthenticated: true });
    } catch (err) {
        res.json({ isAuthenticated: false });
    }
});

export default router;
