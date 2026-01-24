import express from 'express';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars from .env.local for local dev compatibility with Vite
dotenv.config({ path: '.env.local' });
// Also try default .env just in case
dotenv.config();

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Supabase Config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("CRITICAL ERROR: SUPABASE_URL and SUPABASE_KEY must be set.");
  // We don't exit process so build steps might pass, but runtime will fail
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de tentatives de connexion',
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Configure Multer (Memory Storage for forwarding to Supabase)
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

// --- Validation Schemas ---
const licenseSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  nationality: z.string().min(1, "La nationalité est requise"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  club: z.string().min(1, "Le club est requis"),
  category: z.enum(['Junior', 'Senior', 'Pro']),
  type: z.enum(['Compétition', 'Loisir']),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  photoUrl: z.string().optional(),
});

const updateLicenseSchema = licenseSchema.partial();
const statusSchema = z.object({
  status: z.enum(['VALIDE', 'EXPIRÉ', 'DÉSACTIVÉ'])
});

// --- Auth Middleware ---
const authenticate = (req, res, next) => {
  if (req.cookies.admin_session === 'true') {
    next();
  } else {
    res.status(401).json({ error: 'Non autorisé' });
  }
};

// --- API Routes ---

// Login
app.post('/api/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.cookie('admin_session', 'true', {
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

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  res.json({ isAuthenticated: req.cookies.admin_session === 'true' });
});

// File Upload to Supabase Storage
app.post('/api/upload', authenticate, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const fileName = `photo-${uniqueSuffix}${ext}`;

    const { data, error } = await supabase.storage
      .from('licenses-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('licenses-photos')
      .getPublicUrl(fileName);

    res.json({ url: publicData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Get All Licenses
app.get('/api/licenses', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des licences' });
  }
});

// Get License By ID
app.get('/api/licenses/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create License
app.post('/api/licenses', authenticate, async (req, res) => {
  const validation = licenseSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  }

  const data = validation.data;
  const year = new Date().getFullYear();
  const yearPrefix = `FSS-${year}-`;

  try {
    // Generate Sequence ID (Note: Supabase has sequence feature, but we'll mimic existing logic for now)
    // Beware of race conditions here correctly handled by atomic increment in standard DBs.
    // Ideally use a Postgres Sequence. For now we will select latest like before.

    // Simple fetch of last ID for this year
    const { data: lastLicenses } = await supabase
      .from('licenses')
      .select('id')
      .like('id', `${yearPrefix}%`)
      .order('id', { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (lastLicenses && lastLicenses.length > 0) {
      const parts = lastLicenses[0].id.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }

    const newId = `${yearPrefix}${nextSeq.toString().padStart(6, '0')}`;
    const now = Date.now();

    const newLicense = {
      ...data,
      id: newId,
      status: 'VALIDE',
      createdAt: now
    };

    const { error } = await supabase.from('licenses').insert([newLicense]);
    if (error) throw error;

    res.status(201).json(newLicense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// Update License
app.put('/api/licenses/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const validation = updateLicenseSchema.safeParse(req.body);

  if (!validation.success) return res.status(400).json({ error: 'Données invalides' });
  const data = validation.data;
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });

  try {
    const { error } = await supabase
      .from('licenses')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update Status
app.patch('/api/licenses/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const validation = statusSchema.safeParse(req.body);

  if (!validation.success) return res.status(400).json({ error: 'Status invalide' });
  const { status } = validation.data;

  try {
    const { error } = await supabase
      .from('licenses')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fallback
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur inattendue est survenue' });
});

app.get('*', (req, res) => {
  if (req.accepts('html')) {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) res.status(404).send('Frontend not built.');
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default server; 