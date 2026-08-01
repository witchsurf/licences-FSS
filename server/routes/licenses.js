import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { supabase, JWT_SECRET } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { licenseSchema, updateLicenseSchema, statusSchema } from '../schemas/license.js';
import { buildClubList, normalizeClubName } from '../../shared/clubs.js';

const router = express.Router();
const normalizeLicenseClub = (license) => (
    license ? { ...license, club: normalizeClubName(license.club) } : license
);

const saveClub = async (club) => {
    const name = normalizeClubName(club);
    if (!name) return;

    const { error } = await supabase
        .from('clubs')
        .upsert({ name, normalized_name: name.toUpperCase() }, { onConflict: 'normalized_name' });

    // Keep deployments compatible while the clubs migration is being applied.
    if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
};

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

// File Upload (Photo)
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
        console.error("Erreur lors de l'upload :", err);
        res.status(500).json({ error: 'Erreur lors de l\'upload', details: err.message || err });
    }
});

// Document Upload (Passport, ID Card, Birth Certificate)
const documentUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for documents
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format non supporté. Formats acceptés : JPEG, PNG, WebP, PDF'));
        }
    }
});

router.post('/upload-document', authenticate, documentUpload.single('document'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const fileName = `document-${uniqueSuffix}${ext}`;

        const { error } = await supabase.storage
            .from('licenses-documents')
            .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

        if (error) throw error;

        const { data: publicData } = supabase.storage
            .from('licenses-documents')
            .getPublicUrl(fileName);

        res.json({ url: publicData.publicUrl });
    } catch (err) {
        console.error("Erreur lors de l'upload du document :", err);
        res.status(500).json({ error: 'Erreur lors de l\'upload du document', details: err.message || err });
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
        res.json(data.map(normalizeLicenseClub));
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Reusable club list, including custom names previously saved through "Autre".
router.get('/clubs', authenticate, async (req, res) => {
    try {
        const { data: licenses, error } = await supabase
            .from('licenses')
            .select('club');

        if (error) throw error;

        const { data: savedClubs, error: clubsError } = await supabase
            .from('clubs')
            .select('name');

        if (clubsError && clubsError.code !== '42P01' && clubsError.code !== 'PGRST205') {
            throw clubsError;
        }

        res.json(buildClubList([
            ...licenses,
            ...(savedClubs || []).map(({ name }) => name),
        ]));
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors du chargement des clubs' });
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

        res.json(normalizeLicenseClub(data));
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

        const newLicense = {
            ...validation.data,
            club: normalizeClubName(validation.data.club),
            id: newId,
            status: 'VALIDE',
            createdAt: Date.now(),
        };
        const { error } = await supabase.from('licenses').insert([newLicense]);
        if (error) throw error;

        await saveClub(newLicense.club);

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
        const updateData = {
            ...validation.data,
            ...(validation.data.club && { club: normalizeClubName(validation.data.club) }),
        };
        const { error } = await supabase.from('licenses').update(updateData).eq('id', req.params.id);
        if (error) throw error;
        if (updateData.club) await saveClub(updateData.club);
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
