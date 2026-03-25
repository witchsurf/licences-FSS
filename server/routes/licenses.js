import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { supabase, JWT_SECRET } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { licenseSchema, updateLicenseSchema, statusSchema } from '../schemas/license.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées'));
        }
    }
});

// File Upload
router.post('/upload', authenticate, upload.single('photo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const fileName = `photo-${uniqueSuffix}${ext}`;

        const { error } = await supabase.storage
            .from('licenses-photos')
            .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

        if (error) throw error;

        const { data: publicData } = supabase.storage
            .from('licenses-photos')
            .getPublicUrl(fileName);

        res.json({ url: publicData.publicUrl });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

// All Licenses
router.get('/', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Single License
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('licenses').select('*').eq('id', req.params.id).single();
        if (error || !data) return res.status(404).json({ error: 'Licence introuvable' });

        const token = req.cookies.admin_token;
        let isAdmin = false;
        if (token) {
            try {
                jwt.verify(token, JWT_SECRET);
                isAdmin = true;
            } catch (e) { }
        }

        if (!isAdmin) {
            delete data.email;
            delete data.phone;
            delete data.address;
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Create
router.post('/', authenticate, async (req, res) => {
    const validation = licenseSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });

    try {
        const { data: newId, error: rpcError } = await supabase.rpc('generate_next_license_id');
        if (rpcError) throw rpcError;

        const newLicense = { ...validation.data, id: newId, status: 'VALIDE', createdAt: Date.now() };
        const { error } = await supabase.from('licenses').insert([newLicense]);
        if (error) throw error;

        res.status(201).json(newLicense);
    } catch (err) {
        console.error("Erreur lors de la création :", err);
        res.status(500).json({ error: 'Erreur lors de la création', details: err.message || err });
    }
});

// Update
router.put('/:id', authenticate, async (req, res) => {
    const validation = updateLicenseSchema.safeParse(req.body);
    if (!validation.success) {
        console.error("Validation error during update:", validation.error.format());
        return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
    }

    try {
        const { error } = await supabase.from('licenses').update(validation.data).eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Status
router.patch('/:id/status', authenticate, async (req, res) => {
    const validation = statusSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Status invalide' });

    try {
        const { error } = await supabase.from('licenses').update({ status: validation.data.status }).eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
