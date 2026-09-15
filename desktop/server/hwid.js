const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOCK_ALGORITHM = 'aes-256-gcm';
const LOCK_KEY = Buffer.from('4c69636d67722d6465736b746f702d687769642d6b65792d3230323621', 'hex').subarray(0, 32);

/**
 * Generate a hardware fingerprint based on machine-specific identifiers.
 * Combines: CPU model, OS serial number, hostname, total memory, MAC addresses.
 */
function generateFingerprint() {
  const parts = [];

  // CPU model
  parts.push(os.cpus()[0]?.model || 'unknown-cpu');

  // Hostname
  parts.push(os.hostname());

  // Total memory (rounded to GB to avoid minor fluctuations)
  parts.push(String(Math.round(os.totalmem() / (1024 * 1024 * 1024))));

  // OS platform + arch
  parts.push(os.platform() + '-' + os.arch());

  // MAC addresses (sorted, non-internal only)
  const interfaces = os.networkInterfaces();
  const macs = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macs.push(iface.mac);
      }
    }
  }
  macs.sort();
  parts.push(macs.join(',') || 'no-mac');

  // OS serial number (platform-specific)
  try {
    if (os.platform() === 'darwin') {
      const serial = execSync('ioreg -l | grep IOPlatformSerialNumber', { encoding: 'utf8' });
      const match = serial.match(/"IOPlatformSerialNumber"\s*=\s*"([^"]+)"/);
      if (match) parts.push(match[1]);
    } else if (os.platform() === 'win32') {
      const serial = execSync('wmic bios get serialnumber', { encoding: 'utf8' });
      const lines = serial.trim().split('\n');
      if (lines[1]) parts.push(lines[1].trim());
    }
  } catch (e) {
    parts.push('no-serial');
  }

  const raw = parts.join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Encrypt and store the fingerprint in a license file.
 */
function storeLicense(licensePath, fingerprint) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(LOCK_ALGORITHM, LOCK_KEY, iv);

  const data = JSON.stringify({
    hwid: fingerprint,
    activatedAt: new Date().toISOString(),
    version: '1.0.0',
  });

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const licenseData = {
    iv: iv.toString('hex'),
    data: encrypted,
    tag: authTag.toString('hex'),
  };

  const dir = path.dirname(licensePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(licensePath, JSON.stringify(licenseData), 'utf8');
}

/**
 * Read and decrypt the stored license file.
 * Returns the stored fingerprint or null if invalid/missing.
 */
function readLicense(licensePath) {
  try {
    if (!fs.existsSync(licensePath)) return null;

    const raw = fs.readFileSync(licensePath, 'utf8');
    const licenseData = JSON.parse(raw);

    const decipher = crypto.createDecipheriv(
      LOCK_ALGORITHM,
      LOCK_KEY,
      Buffer.from(licenseData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(licenseData.tag, 'hex'));

    let decrypted = decipher.update(licenseData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

/**
 * Validate the current machine against the stored license.
 * Returns: { valid: true } or { valid: false, reason: string }
 */
function validateLicense(licensePath) {
  const currentFingerprint = generateFingerprint();
  const storedLicense = readLicense(licensePath);

  // First launch — no license file yet
  if (!storedLicense) {
    return { valid: true, firstLaunch: true, fingerprint: currentFingerprint };
  }

  // Check fingerprint match
  if (storedLicense.hwid === currentFingerprint) {
    return { valid: true, firstLaunch: false, fingerprint: currentFingerprint };
  }

  return {
    valid: false,
    firstLaunch: false,
    reason: 'Cet installeur a déjà été activé sur une autre machine. Contactez l\'éditeur pour obtenir une nouvelle licence.',
  };
}

/**
 * Activate the license on the current machine.
 */
function activateLicense(licensePath) {
  const fingerprint = generateFingerprint();
  storeLicense(licensePath, fingerprint);
  return { success: true, fingerprint };
}

module.exports = {
  generateFingerprint,
  validateLicense,
  activateLicense,
  readLicense,
};
