const express = require('express');
const { authenticate } = require('../middleware/auth');
const db = require('../db');
const { savePhoto } = require('../storage');
const multer = require('multer');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  },
});

/**
 * Check if the entity has been set up.
 * Public route — used by frontend to decide whether to show wizard.
 */
router.get('/status', (req, res) => {
  try {
    const config = db.getEntityConfig();
    res.json({
      isSetup: !!config.entityName,
      entityName: config.entityName || null,
      entityAcronym: config.entityAcronym || null,
      entityCountry: config.entityCountry || 'SN',
      entityFlag: config.entityFlag || null,
      entityLogo: config.entityLogo || null,
      entityAffiliations: config.entityAffiliations || '',
    });
  } catch (err) {
    console.error('Error checking setup status:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Get full entity configuration.
 */
router.get('/config', (req, res) => {
  try {
    const config = db.getEntityConfig();
    res.json(config);
  } catch (err) {
    console.error('Error getting config:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Upload entity logo.
 */
router.post('/logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

  try {
    const url = savePhoto(req.file.buffer, req.file.originalname);
    res.json({ url });
  } catch (err) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ error: "Erreur lors de l'upload du logo" });
  }
});

/**
 * Upload entity custom flag.
 */
router.post('/flag', upload.single('flag'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

  try {
    const url = savePhoto(req.file.buffer, req.file.originalname);
    res.json({ url });
  } catch (err) {
    console.error('Error uploading flag:', err);
    res.status(500).json({ error: "Erreur lors de l'upload du drapeau" });
  }
});

/**
 * Upload partner institution logo.
 */
router.post('/institution-logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

  try {
    const url = savePhoto(req.file.buffer, req.file.originalname);
    res.json({ url });
  } catch (err) {
    console.error('Error uploading institution logo:', err);
    res.status(500).json({ error: "Erreur lors de l'upload du logo d'institution" });
  }
});

/**
 * Initial setup — configure entity.
 * This can only be called once (when no entity is configured yet).
 */
router.post('/initialize', (req, res) => {
  try {
    const existing = db.getEntityConfig();
    if (existing.entityName) {
      return res.status(400).json({ error: 'L\'entité a déjà été configurée' });
    }

    const { entityName, entityAcronym, entityCountry, entityFlag, entityLogo, entityAddress, entityPhone, entityEmail, entityAffiliations, adminPassword } = req.body;

    if (!entityName || !adminPassword) {
      return res.status(400).json({ error: 'Le nom de l\'entité et le mot de passe admin sont requis' });
    }

    // Save entity config
    db.setEntityConfig('entityName', entityName);
    if (entityAcronym) db.setEntityConfig('entityAcronym', entityAcronym.toUpperCase());
    if (entityCountry) db.setEntityConfig('entityCountry', entityCountry);
    if (entityFlag) db.setEntityConfig('entityFlag', entityFlag);
    if (entityLogo) db.setEntityConfig('entityLogo', entityLogo);
    if (entityAddress) db.setEntityConfig('entityAddress', entityAddress);
    if (entityPhone) db.setEntityConfig('entityPhone', entityPhone);
    if (entityEmail) db.setEntityConfig('entityEmail', entityEmail);
    if (entityAffiliations !== undefined) db.setEntityConfig('entityAffiliations', entityAffiliations);
    db.setEntityConfig('adminPassword', adminPassword);
    db.setEntityConfig('setupCompletedAt', new Date().toISOString());

    // Update the runtime admin password
    const config = require('../config');
    config.ADMIN_PASSWORD = adminPassword;

    res.json({ success: true });
  } catch (err) {
    console.error('Error during setup:', err);
    res.status(500).json({ error: 'Erreur lors de la configuration' });
  }
});

/**
 * Update entity configuration (requires auth).
 */
router.put('/config', authenticate, (req, res) => {
  try {
    const { entityName, entityAcronym, entityCountry, entityFlag, entityLogo, entityAddress, entityPhone, entityEmail, entityAffiliations, adminPassword } = req.body;

    if (entityName) db.setEntityConfig('entityName', entityName);
    if (entityAcronym) db.setEntityConfig('entityAcronym', entityAcronym.toUpperCase());
    if (entityCountry !== undefined) db.setEntityConfig('entityCountry', entityCountry);
    if (entityFlag !== undefined) db.setEntityConfig('entityFlag', entityFlag);
    if (entityLogo) db.setEntityConfig('entityLogo', entityLogo);
    if (entityAddress !== undefined) db.setEntityConfig('entityAddress', entityAddress);
    if (entityPhone !== undefined) db.setEntityConfig('entityPhone', entityPhone);
    if (entityEmail !== undefined) db.setEntityConfig('entityEmail', entityEmail);
    if (entityAffiliations !== undefined) db.setEntityConfig('entityAffiliations', entityAffiliations);
    if (adminPassword && adminPassword.trim().length >= 4) {
      db.setEntityConfig('adminPassword', adminPassword);
      const config = require('../config');
      config.ADMIN_PASSWORD = adminPassword;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

module.exports = router;
