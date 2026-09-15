/**
 * macOS Notarization Script
 * 
 * This script is called by electron-builder after signing.
 * It submits the app to Apple for notarization.
 * 
 * Requirements:
 * - APPLE_ID: Your Apple ID email
 * - APPLE_APP_SPECIFIC_PASSWORD: App-specific password from appleid.apple.com
 * - APPLE_TEAM_ID: Your Apple Developer Team ID
 * 
 * To generate an app-specific password:
 * 1. Go to https://appleid.apple.com/account/manage
 * 2. Sign in → App-Specific Passwords → Generate
 * 3. Store it securely as APPLE_APP_SPECIFIC_PASSWORD env var
 */

const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization: not macOS');
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log('⚠️  Skipping notarization: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID not set');
    console.log('   Set these environment variables to enable notarization.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`🍎 Notarizing ${appPath}...`);

  try {
    await notarize({
      appPath,
      appleId,
      appleIdPassword,
      teamId,
    });
    console.log('✅ Notarization complete!');
  } catch (error) {
    console.error('❌ Notarization failed:', error.message);
    // Don't throw — allow build to continue without notarization
  }
};
