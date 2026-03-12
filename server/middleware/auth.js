import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/supabase.js';

export const authenticate = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.clearCookie('admin_token');
        res.status(401).json({ error: 'Session invalide ou expirée' });
    }
};
