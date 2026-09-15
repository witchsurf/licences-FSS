const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ADMIN_PASSWORD, JWT_SECRET } = require('../config');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de tentatives de connexion',
});

const db = require('../db');

router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  const entityConfig = db.getEntityConfig ? db.getEntityConfig() : {};
  const validPassword = entityConfig.adminPassword || ADMIN_PASSWORD;

  if (password === validPassword) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: false, // Desktop app runs on localhost
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
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

module.exports = router;
