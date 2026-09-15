const path = require('path');
const fs = require('fs');

// Determine userData path
const oldDataPath = path.join(require('os').homedir(), '.fss-license-manager');
const defaultDataPath = path.join(require('os').homedir(), '.licences-manager');
const userDataPath = process.env.FSS_USER_DATA || (fs.existsSync(oldDataPath) ? oldDataPath : defaultDataPath);

// Ensure directories exist
const dbDir = userDataPath;
const uploadsDir = path.join(userDataPath, 'uploads');
const photosDir = path.join(uploadsDir, 'photos');
const documentsDir = path.join(uploadsDir, 'documents');

[dbDir, uploadsDir, photosDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Determine DB file
let dbFile = path.join(dbDir, 'licences.db');
if (!fs.existsSync(dbFile) && fs.existsSync(path.join(dbDir, 'fss.db'))) {
  dbFile = path.join(dbDir, 'fss.db');
}

module.exports = {
  PORT: parseInt(process.env.PORT) || 3456,
  DB_PATH: dbFile,
  UPLOADS_DIR: uploadsDir,
  PHOTOS_DIR: photosDir,
  DOCUMENTS_DIR: documentsDir,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
  JWT_SECRET: process.env.JWT_SECRET || 'licences-manager-secret-key-2026',
  USER_DATA_PATH: userDataPath,
};
