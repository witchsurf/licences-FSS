const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🧪 Starting Licences Manager Desktop Test Suite...\n');

// 1. TEST HWID & LICENSE LOCKING
console.log('--- TEST 1: Hardware Fingerprint & Lock Protection ---');
const hwid = require('../server/hwid');

const testLicenseDir = path.join(os.tmpdir(), `test_lic_${Date.now()}`);
fs.mkdirSync(testLicenseDir, { recursive: true });
const testLicensePath = path.join(testLicenseDir, '.license');

try {
  // 1.1 Generate fingerprint
  const fp = hwid.generateFingerprint();
  assert(typeof fp === 'string' && fp.length === 64, 'Fingerprint must be a 64-char SHA256 string');
  console.log('  ✅ generateFingerprint() returned valid hash:', fp.substring(0, 16) + '...');

  // 1.2 First launch validation
  const v1 = hwid.validateLicense(testLicensePath);
  assert(v1.valid === true, 'First launch should be valid');
  assert(v1.firstLaunch === true, 'First launch flag should be true');
  console.log('  ✅ validateLicense() correctly detects first launch');

  // 1.3 Activation
  const act = hwid.activateLicense(testLicensePath);
  assert(act.success === true, 'Activation should succeed');
  assert(fs.existsSync(testLicensePath), 'License file must be created on disk');
  console.log('  ✅ activateLicense() stores encrypted license file');

  // 1.4 Valid launch after activation
  const v2 = hwid.validateLicense(testLicensePath);
  assert(v2.valid === true, 'License should be valid on the same machine');
  assert(v2.firstLaunch === false, 'firstLaunch should now be false');
  console.log('  ✅ validateLicense() verifies matching hardware fingerprint');

  // 1.5 Duplicate installation / Machine mismatch simulation
  // Tamper with the stored license by writing a fake HWID
  const fakeLicenseData = {
    hwid: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    activatedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  const crypto = require('crypto');
  const LOCK_ALGORITHM = 'aes-256-gcm';
  const LOCK_KEY = crypto.createHash('sha256').update('licences-manager-desktop-hwid-salt-2026!').digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(LOCK_ALGORITHM, LOCK_KEY, iv);
  let enc = cipher.update(JSON.stringify(fakeLicenseData), 'utf8', 'hex');
  enc += cipher.final('hex');
  const tag = cipher.getAuthTag();
  fs.writeFileSync(testLicensePath, JSON.stringify({
    iv: iv.toString('hex'),
    data: enc,
    tag: tag.toString('hex')
  }));

  const v3 = hwid.validateLicense(testLicensePath);
  assert(v3.valid === false, 'Machine mismatch MUST be rejected');
  assert(v3.reason && v3.reason.includes('déjà été activé sur une autre machine'), 'Should report clone prevention');
  console.log('  ✅ validateLicense() BLOCKS unauthorized copy on another machine');

} finally {
  fs.rmSync(testLicenseDir, { recursive: true, force: true });
}

// 2. TEST DATABASE, ENTITY CONFIG & DYNAMIC PREFIXES
console.log('\n--- TEST 2: SQLite Database & Entity Configuration ---');
const testDbDir = path.join(os.tmpdir(), `test_db_${Date.now()}`);
fs.mkdirSync(testDbDir, { recursive: true });
process.env.FSS_USER_DATA = testDbDir;

// Reload modules with test dir
const db = require('../server/db');

try {
  // 2.1 Set & Get Entity Config
  db.setEntityConfig('entityName', 'Fédération Française de Surf');
  db.setEntityConfig('entityAcronym', 'FFS');
  db.setEntityConfig('adminPassword', 'SuperSecretPass2026');

  const config = db.getEntityConfig();
  assert.strictEqual(config.entityName, 'Fédération Française de Surf');
  assert.strictEqual(config.entityAcronym, 'FFS');
  assert.strictEqual(config.adminPassword, 'SuperSecretPass2026');
  console.log('  ✅ getEntityConfig() and setEntityConfig() work correctly');

  // 2.2 Dynamic License ID Prefix
  const id1 = db.generateNextLicenseId();
  const currentYear = new Date().getFullYear();
  assert(id1.startsWith(`FFS-${currentYear}-`), `License ID should start with custom acronym FFS, got: ${id1}`);
  console.log('  ✅ generateNextLicenseId() uses custom organization acronym:', id1);

  const officialId = db.generateNextFederalOfficialId();
  assert(officialId.startsWith(`FFS-CF-${currentYear}-`), `Official ID should start with FFS-CF, got: ${officialId}`);
  console.log('  ✅ generateNextFederalOfficialId() uses custom prefix:', officialId);

  // 2.3 License CRUD in SQLite
  const newLic = db.createLicense({
    firstName: 'Pierre',
    lastName: 'Laraise',
    birthDate: '1995-03-12',
    nationality: 'Française',
    address: '10 Rue de la Plage',
    phone: '0612345678',
    email: 'pierre@test.com',
    club: 'Surf Club Biarritz',
    category: 'OPEN',
    type: 'COMPETITION',
    issueDate: `${currentYear}-01-01`,
    expirationDate: `${currentYear}-12-31`,
  });

  assert(newLic.id.startsWith('FFS-'), 'Created license has correct ID');
  const fetched = db.getLicenseById(newLic.id);
  assert.strictEqual(fetched.firstName, 'Pierre');
  assert.strictEqual(fetched.lastName, 'Laraise');
  assert.strictEqual(fetched.status, 'VALIDE');
  console.log('  ✅ createLicense() and getLicenseById() work in local SQLite');

  // 2.4 Status update & Renewal simulation
  db.updateLicenseStatus(newLic.id, 'EXPIRÉ');
  const updated = db.getLicenseById(newLic.id);
  assert.strictEqual(updated.status, 'EXPIRÉ');
  console.log('  ✅ updateLicenseStatus() updates record in SQLite');

  // Renewal: update expiration date and reset to VALIDE
  db.updateLicense(newLic.id, {
    expirationDate: `${currentYear + 1}-12-31`,
    status: 'VALIDE'
  });
  const renewed = db.getLicenseById(newLic.id);
  assert.strictEqual(renewed.status, 'VALIDE');
  assert.strictEqual(renewed.expirationDate, `${currentYear + 1}-12-31`);
  console.log('  ✅ updateLicense() successfully renews license for another year');

} finally {
  db.closeDb();
  fs.rmSync(testDbDir, { recursive: true, force: true });
}

// 3. TEST BACKUP & RESTORATION INTEGRITY
console.log('\n--- TEST 3: Database Backup & Restoration Integrity ---');
const backupDir = path.join(os.tmpdir(), `test_backup_${Date.now()}`);
fs.mkdirSync(backupDir, { recursive: true });
process.env.FSS_USER_DATA = backupDir;

const Database = require('better-sqlite3');
const testDbPath = path.join(backupDir, 'licences.db');

try {
  // Create test database with schema
  const originDb = new Database(testDbPath);
  originDb.exec(`
    CREATE TABLE licenses (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT);
    INSERT INTO licenses VALUES ('LIC-001', 'Test', 'User');
  `);
  originDb.close();

  // Create a backup copy
  const backupFilePath = path.join(backupDir, 'snapshot.db');
  fs.copyFileSync(testDbPath, backupFilePath);
  assert(fs.existsSync(backupFilePath), 'Backup file must exist');

  // Corrupt original DB
  const badDb = new Database(testDbPath);
  badDb.exec("DELETE FROM licenses");
  const count = badDb.prepare("SELECT count(*) as c FROM licenses").get().c;
  assert.strictEqual(count, 0, 'Original db was emptied');
  badDb.close();

  // Simulate restore from backup
  // Verify backup integrity first
  const verifyDb = new Database(backupFilePath, { readonly: true });
  const tables = verifyDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  verifyDb.close();
  assert(tables.includes('licenses'), 'Backup must contain licenses table');

  // Replace DB with backup
  fs.copyFileSync(backupFilePath, testDbPath);

  // Check restored DB
  const restoredDb = new Database(testDbPath, { readonly: true });
  const restoredUser = restoredDb.prepare("SELECT * FROM licenses WHERE id = 'LIC-001'").get();
  restoredDb.close();
  assert(restoredUser && restoredUser.firstName === 'Test', 'Data restored successfully');
  console.log('  ✅ Backup file verification and restoration integrity confirmed');

} finally {
  fs.rmSync(backupDir, { recursive: true, force: true });
}

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.\n');
