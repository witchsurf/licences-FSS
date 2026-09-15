const express = require('express');
const path = require('path');
const { validateLicense, activateLicense } = require('../hwid');
const { USER_DATA_PATH } = require('../config');

const router = express.Router();
const LICENSE_PATH = path.join(USER_DATA_PATH, '.license');

/**
 * Check activation status.
 */
router.get('/status', (req, res) => {
  try {
    const result = validateLicense(LICENSE_PATH);
    res.json({
      activated: !result.firstLaunch,
      valid: result.valid,
      reason: result.reason || null,
    });
  } catch (err) {
    console.error('Error checking activation:', err);
    res.status(500).json({ error: 'Erreur de vérification' });
  }
});

/**
 * Activate the license on this machine.
 * Called automatically after setup wizard completes.
 */
router.post('/activate', (req, res) => {
  try {
    const validation = validateLicense(LICENSE_PATH);

    if (!validation.valid) {
      return res.status(403).json({
        error: validation.reason,
        blocked: true,
      });
    }

    if (validation.firstLaunch) {
      const result = activateLicense(LICENSE_PATH);
      return res.json({ success: true, activated: true });
    }

    res.json({ success: true, activated: true, alreadyActivated: true });
  } catch (err) {
    console.error('Error activating:', err);
    res.status(500).json({ error: "Erreur lors de l'activation" });
  }
});

module.exports = router;
