import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import authRoutes from './server/routes/auth.js';
import licenseRoutes from './server/routes/licenses.js';
import federalOfficialRoutes from './server/routes/federalOfficials.js';
import multer from 'multer';
import { supabase, PORT } from './server/config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- API Routes ---
app.use('/api', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/federal-officials', federalOfficialRoutes);

// --- Entity Configuration & Setup Persistence ---
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  },
});

let memoryConfig = {
  entityName: 'Fédération Sénégalaise de Surf',
  entityAcronym: 'FSS',
  entityCountry: 'SN',
  entityFlag: null,
  entityLogo: null,
  entityAddress: null,
  entityPhone: null,
  entityEmail: null,
  entityAffiliations: '',
};

async function loadEntityConfig() {
  try {
    const { data, error } = await supabase
      .from('entity_config')
      .select('key, value');

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        if (row && row.key) {
          memoryConfig[row.key] = row.value;
        }
      }
    }
  } catch (err) {
    console.warn('Unable to read entity_config from Supabase:', err.message || err);
  }
  return memoryConfig;
}

async function saveEntityConfig(updates) {
  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined) {
      memoryConfig[k] = v;
    }
  }

  try {
    const rows = Object.entries(updates)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([key, value]) => ({ key, value: String(value) }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('entity_config')
        .upsert(rows, { onConflict: 'key' });

      if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
        console.warn('Supabase entity_config upsert warning:', error.message);
      }
    }
  } catch (err) {
    console.warn('Unable to save entity_config to Supabase:', err.message || err);
  }

  return memoryConfig;
}

async function handleImageUpload(req, res) {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  try {
    const ext = path.extname(file.originalname) || '.png';
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `setup/${Date.now()}-${safeName}${ext}`;

    const { error } = await supabase.storage
      .from('licenses-photos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (!error) {
      const { data: publicData } = supabase.storage
        .from('licenses-photos')
        .getPublicUrl(fileName);

      if (publicData?.publicUrl) {
        return res.json({ url: publicData.publicUrl });
      }
    } else {
      console.warn('Supabase storage upload warning, using base64 fallback:', error.message);
    }
  } catch (err) {
    console.warn('Storage upload error, using base64 fallback:', err.message || err);
  }

  // Fallback to base64 Data URL so the uploaded file is never lost or replaced
  const base64Url = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return res.json({ url: base64Url });
}

app.get('/api/setup/status', async (req, res) => {
  const config = await loadEntityConfig();
  res.json({
    isSetup: !!config.entityName,
    entityName: config.entityName || 'Fédération Sénégalaise de Surf',
    entityAcronym: config.entityAcronym || 'FSS',
    entityCountry: config.entityCountry || 'SN',
    entityFlag: config.entityFlag || null,
    entityLogo: config.entityLogo || null,
    entityAddress: config.entityAddress || null,
    entityPhone: config.entityPhone || null,
    entityEmail: config.entityEmail || null,
    entityAffiliations: config.entityAffiliations || '',
  });
});

app.get('/api/setup/config', async (req, res) => {
  const config = await loadEntityConfig();
  res.json(config);
});

app.put('/api/setup/config', async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Données invalides' });
  }
  const config = await saveEntityConfig(updates);
  res.json({ success: true, config });
});

app.post('/api/setup/initialize', async (req, res) => {
  const updates = req.body;
  if (!updates || !updates.entityName) {
    return res.status(400).json({ error: "Le nom de l'entité est requis" });
  }
  const config = await saveEntityConfig(updates);
  res.json({ success: true, config });
});

app.post(
  ['/api/setup/logo', '/api/setup/flag', '/api/setup/institution-logo'],
  upload.any(),
  handleImageUpload
);

app.get('/api/activation/status', (req, res) => {
  res.json({ activated: true, valid: true });
});
app.post('/api/activation/activate', (req, res) => {
  res.json({ success: true });
});

// --- Error Handling & Fallback ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur inattendue est survenue'
  });
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

// Export app for Vercel
export default app;

// Start server
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Premium FSS Server running on http://localhost:${PORT}`);
  });
}
