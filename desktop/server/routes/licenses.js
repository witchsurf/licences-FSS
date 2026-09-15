const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');
const { licenseSchema, updateLicenseSchema, statusSchema } = require('../schemas/license');
const { savePhoto, saveDocument } = require('../storage');
const { JWT_SECRET } = require('../config');
const db = require('../db');

// Load clubs helper — use extraResources path in packaged app, fallback for dev
let clubsModule;
try {
  const path = require('path');
  // In packaged app, extraResources are at process.resourcesPath/shared
  const resourcesShared = path.join(process.resourcesPath || '', 'shared', 'clubs.js');
  const devShared = path.join(__dirname, '..', '..', '..', 'shared', 'clubs.js');
  const fs = require('fs');
  if (fs.existsSync(resourcesShared)) {
    clubsModule = require(resourcesShared);
  } else {
    clubsModule = require(devShared);
  }
} catch (e) {
  // Fallback: inline minimal implementation
  clubsModule = {
    normalizeClubName: (club) => (typeof club === 'string' ? club.trim() : club),
    buildClubList: (licenses = []) => {
      const clubs = new Set();
      for (const l of licenses) {
        const club = typeof l === 'string' ? l : l?.club;
        if (club) clubs.add(club.trim());
      }
      return [...clubs].sort();
    },
  };
}

const { normalizeClubName, buildClubList } = clubsModule;

const router = express.Router();

const normalizeLicenseClub = (license) =>
  license ? { ...license, club: normalizeClubName(license.club) } : license;

const saveClubToDb = (club) => {
  const name = normalizeClubName(club);
  if (!name) return;
  try {
    db.saveClub(name, name.toUpperCase());
  } catch (e) {
    // Ignore duplicate key errors
  }
};

// Photo Upload
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

router.post('/upload', authenticate, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

  try {
    const url = savePhoto(req.file.buffer, req.file.originalname);
    res.json({ url });
  } catch (err) {
    console.error("Erreur lors de l'upload :", err);
    res.status(500).json({ error: "Erreur lors de l'upload", details: err.message });
  }
});

// Document Upload
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Formats acceptés : JPEG, PNG, WebP, PDF'));
    }
  },
});

router.post('/upload-document', authenticate, documentUpload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

  try {
    const url = saveDocument(req.file.buffer, req.file.originalname);
    res.json({ url });
  } catch (err) {
    console.error("Erreur lors de l'upload du document :", err);
    res.status(500).json({ error: "Erreur lors de l'upload du document", details: err.message });
  }
});

// All Licenses
router.get('/', authenticate, (req, res) => {
  try {
    const data = db.getAllLicenses();
    res.json(data.map(normalizeLicenseClub));
  } catch (err) {
    console.error('Error fetching licenses:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Club list
router.get('/clubs', authenticate, (req, res) => {
  try {
    const licensesClubs = db.getLicenseClubs().map(c => ({ club: c }));
    const savedClubs = db.getAllClubs();
    res.json(buildClubList([...licensesClubs, ...savedClubs]));
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des clubs' });
  }
});

// Single License
router.get('/:id', (req, res) => {
  try {
    const data = db.getLicenseById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Licence introuvable' });

    const token = req.cookies.admin_token;
    let isAdmin = false;
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        isAdmin = true;
      } catch (e) {}
    }

    if (!isAdmin) {
      delete data.email;
      delete data.phone;
      delete data.address;
    }

    res.json(normalizeLicenseClub(data));
  } catch (err) {
    console.error('Error fetching license:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create
router.post('/', authenticate, (req, res) => {
  const validation = licenseSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  }

  try {
    const licenseData = {
      ...validation.data,
      club: normalizeClubName(validation.data.club),
    };
    const newLicense = db.createLicense(licenseData);
    saveClubToDb(newLicense.club);
    res.status(201).json(newLicense);
  } catch (err) {
    console.error('Erreur lors de la création :', err);
    res.status(500).json({ error: 'Erreur lors de la création', details: err.message });
  }
});

// Update
router.put('/:id', authenticate, (req, res) => {
  const validation = updateLicenseSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Données invalides', details: validation.error.format() });
  }

  try {
    const updateData = {
      ...validation.data,
      ...(validation.data.club && { club: normalizeClubName(validation.data.club) }),
    };
    db.updateLicense(req.params.id, updateData);
    if (updateData.club) saveClubToDb(updateData.club);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating license:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Status
router.patch('/:id/status', authenticate, (req, res) => {
  const validation = statusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Status invalide' });
  }

  try {
    db.updateLicenseStatus(req.params.id, validation.data.status);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
