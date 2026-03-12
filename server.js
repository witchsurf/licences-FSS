import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import authRoutes from './server/routes/auth.js';
import licenseRoutes from './server/routes/licenses.js';
import { PORT } from './server/config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(cookieParser());

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- API Routes ---
app.use('/api', authRoutes);
app.use('/api/licenses', licenseRoutes);

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