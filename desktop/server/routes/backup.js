const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Database = require('better-sqlite3');
const { authenticate } = require('../middleware/auth');
const { DB_PATH, USER_DATA_PATH } = require('../config');
const db = require('../db');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

/**
 * Download database backup snapshot
 */
router.get('/download', authenticate, (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(404).json({ error: 'Fichier de base de données introuvable' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `licences-backup-${timestamp}.db`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(DB_PATH);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Error exporting backup:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la sauvegarde' });
  }
});

/**
 * Restore database from uploaded file
 */
router.post('/restore', authenticate, upload.single('backup'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier de sauvegarde fourni' });
  }

  const tempPath = path.join(USER_DATA_PATH, `temp_restore_${Date.now()}.db`);

  try {
    // Write buffer to temporary file for verification
    fs.writeFileSync(tempPath, req.file.buffer);

    // Verify it's a valid SQLite database with required tables
    const testDb = new Database(tempPath, { readonly: true });
    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    testDb.close();

    if (!tables.includes('licenses')) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'Le fichier fourni n\'est pas une sauvegarde valide de Licences Manager.' });
    }

    // Close current active database
    db.closeDb();

    // Create a safety backup of current DB before replacing
    const safetyBackup = `${DB_PATH}.prev`;
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, safetyBackup);
    }

    // Overwrite with restored DB
    fs.copyFileSync(tempPath, DB_PATH);
    fs.unlinkSync(tempPath);

    // Reopen and re-initialize DB
    db.getDb();

    res.json({ success: true, message: 'Base de données restaurée avec succès' });
  } catch (err) {
    console.error('Error restoring backup:', err);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ error: 'Erreur lors de la restauration : ' + err.message });
  }
});

module.exports = router;
