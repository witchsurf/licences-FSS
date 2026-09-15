const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const { PORT, UPLOADS_DIR } = require('./server/config');
const db = require('./server/db');

const authRoutes = require('./server/routes/auth');
const licenseRoutes = require('./server/routes/licenses');
const federalOfficialRoutes = require('./server/routes/federalOfficials');
const setupRoutes = require('./server/routes/setup');
const activationRoutes = require('./server/routes/activation');

const app = express();

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(cookieParser());

// Serve frontend static files from the built dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Serve uploaded files (photos & documents)
app.use('/uploads', express.static(UPLOADS_DIR));

// --- API Routes ---
app.use('/api', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/federal-officials', federalOfficialRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/activation', activationRoutes);

// --- Error Handling & Fallback ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur inattendue est survenue',
  });
});

app.get('*', (req, res) => {
  if (req.accepts('html')) {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) res.status(404).send('Frontend not built. Run npm run build:frontend first.');
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Cleanup function
function cleanup() {
  db.closeDb();
  console.log('🔒 Database connection closed');
}

module.exports = { app, cleanup };
