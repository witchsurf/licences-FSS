const Database = require('better-sqlite3');
const { DB_PATH } = require('./config');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db;

  // Create licenses table
  database.exec(`
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      nationality TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      club TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      expirationDate TEXT NOT NULL,
      photoUrl TEXT,
      documentUrl TEXT,
      documentType TEXT,
      status TEXT NOT NULL DEFAULT 'VALIDE',
      createdAt INTEGER NOT NULL
    )
  `);

  // Create federal_officials table
  database.exec(`
    CREATE TABLE IF NOT EXISTS federal_officials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      nationality TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      expirationDate TEXT NOT NULL,
      photoUrl TEXT,
      photoPositionX REAL,
      photoPositionY REAL,
      createdAt INTEGER NOT NULL
    )
  `);

  // Create clubs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      name TEXT NOT NULL,
      normalized_name TEXT PRIMARY KEY
    )
  `);

  // Create sequences table for ID generation
  database.exec(`
    CREATE TABLE IF NOT EXISTS sequences (
      name TEXT PRIMARY KEY,
      current_value INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Create entity_config table
  database.exec(`
    CREATE TABLE IF NOT EXISTS entity_config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Initialize sequences if they don't exist
  const insertSeq = database.prepare(
    'INSERT OR IGNORE INTO sequences (name, current_value) VALUES (?, 0)'
  );
  insertSeq.run('license_seq');
  insertSeq.run('federal_official_seq');

  // Regularize all licenses & federal officials to calendar year expiration (YYYY-12-31)
  try {
    database.exec(`
      UPDATE licenses 
      SET expirationDate = CASE 
        WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31'
        ELSE substr(issueDate, 1, 4) || '-12-31'
      END
      WHERE expirationDate != (CASE WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31' ELSE substr(issueDate, 1, 4) || '-12-31' END);

      UPDATE federal_officials 
      SET expirationDate = CASE 
        WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31'
        ELSE substr(issueDate, 1, 4) || '-12-31'
      END
      WHERE expirationDate != (CASE WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31' ELSE substr(issueDate, 1, 4) || '-12-31' END);
    `);
  } catch (e) {
    console.warn('SQLite regularization notice:', e.message);
  }

  console.log('✅ Database schema initialized');
}

function regularizeExpirations() {
  const database = getDb();
  let updatedCount = 0;
  try {
    const licRes = database.prepare(`
      UPDATE licenses 
      SET expirationDate = CASE 
        WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31'
        ELSE substr(issueDate, 1, 4) || '-12-31'
      END
      WHERE expirationDate != (CASE WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31' ELSE substr(issueDate, 1, 4) || '-12-31' END)
    `).run();

    const offRes = database.prepare(`
      UPDATE federal_officials 
      SET expirationDate = CASE 
        WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31'
        ELSE substr(issueDate, 1, 4) || '-12-31'
      END
      WHERE expirationDate != (CASE WHEN id LIKE '%-2026-%' OR issueDate LIKE '2026%' THEN '2026-12-31' ELSE substr(issueDate, 1, 4) || '-12-31' END)
    `).run();

    updatedCount = (licRes?.changes || 0) + (offRes?.changes || 0);
  } catch (e) {
    console.error('Error in regularizeExpirations:', e);
  }
  return { updatedCount };
}

// Entity Config functions
function getEntityConfig() {
  const rows = getDb().prepare('SELECT key, value FROM entity_config').all();
  const config = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

function setEntityConfig(key, value) {
  getDb().prepare(`
    INSERT INTO entity_config (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

// Generate next license ID
function generateNextLicenseId() {
  const database = getDb();
  const year = new Date().getFullYear();
  const config = getEntityConfig();
  const prefix = config.entityAcronym || config.entityPrefix || 'LIC';

  const update = database.prepare(
    'UPDATE sequences SET current_value = current_value + 1 WHERE name = ?'
  );
  const select = database.prepare(
    'SELECT current_value FROM sequences WHERE name = ?'
  );

  const transaction = database.transaction(() => {
    update.run('license_seq');
    const row = select.get('license_seq');
    return `${prefix}-${year}-${String(row.current_value).padStart(6, '0')}`;
  });

  return transaction();
}

// Generate next federal official ID
function generateNextFederalOfficialId() {
  const database = getDb();
  const year = new Date().getFullYear();
  const config = getEntityConfig();
  const prefix = config.entityAcronym || config.entityPrefix || 'LIC';

  const update = database.prepare(
    'UPDATE sequences SET current_value = current_value + 1 WHERE name = ?'
  );
  const select = database.prepare(
    'SELECT current_value FROM sequences WHERE name = ?'
  );

  const transaction = database.transaction(() => {
    update.run('federal_official_seq');
    const row = select.get('federal_official_seq');
    return `${prefix}-CF-${year}-${String(row.current_value).padStart(4, '0')}`;
  });

  return transaction();
}

// --- License CRUD ---

function getAllLicenses() {
  return getDb().prepare('SELECT * FROM licenses ORDER BY createdAt DESC').all();
}

function getLicenseById(id) {
  return getDb().prepare('SELECT * FROM licenses WHERE id = ?').get(id);
}

function createLicense(data) {
  const id = generateNextLicenseId();
  const license = {
    ...data,
    id,
    status: 'VALIDE',
    createdAt: Date.now(),
  };

  const columns = Object.keys(license);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(col => license[col]);

  getDb().prepare(
    `INSERT INTO licenses (${columns.join(', ')}) VALUES (${placeholders})`
  ).run(...values);

  return license;
}

function updateLicense(id, data) {
  const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  getDb().prepare(`UPDATE licenses SET ${sets} WHERE id = ?`).run(...values);
}

function updateLicenseStatus(id, status) {
  getDb().prepare('UPDATE licenses SET status = ? WHERE id = ?').run(status, id);
}

// --- Club CRUD ---

function getAllClubs() {
  return getDb().prepare('SELECT name FROM clubs ORDER BY name').all().map(r => r.name);
}

function saveClub(name, normalizedName) {
  getDb().prepare(
    'INSERT OR IGNORE INTO clubs (name, normalized_name) VALUES (?, ?)'
  ).run(name, normalizedName);
}

function getLicenseClubs() {
  return getDb().prepare('SELECT DISTINCT club FROM licenses').all().map(r => r.club);
}

// --- Federal Official CRUD ---

function getAllFederalOfficials() {
  return getDb().prepare('SELECT * FROM federal_officials ORDER BY createdAt DESC').all();
}

function getFederalOfficialById(id) {
  return getDb().prepare('SELECT * FROM federal_officials WHERE id = ?').get(id);
}

function createFederalOfficial(data) {
  const id = generateNextFederalOfficialId();
  const official = {
    ...data,
    id,
    createdAt: Date.now(),
  };

  const columns = Object.keys(official);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(col => official[col] ?? null);

  getDb().prepare(
    `INSERT INTO federal_officials (${columns.join(', ')}) VALUES (${placeholders})`
  ).run(...values);

  return official;
}

function updateFederalOfficial(id, data) {
  const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data).map(v => v ?? null), id];
  getDb().prepare(`UPDATE federal_officials SET ${sets} WHERE id = ?`).run(...values);
}

function deleteFederalOfficial(id) {
  getDb().prepare('DELETE FROM federal_officials WHERE id = ?').run(id);
}

// Cleanup
function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDb,
  generateNextLicenseId,
  generateNextFederalOfficialId,
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  updateLicenseStatus,
  getAllClubs,
  saveClub,
  getLicenseClubs,
  getAllFederalOfficials,
  getFederalOfficialById,
  createFederalOfficial,
  updateFederalOfficial,
  deleteFederalOfficial,
  getEntityConfig,
  setEntityConfig,
  regularizeExpirations,
  closeDb,
};
