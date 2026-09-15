const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

console.log('🌐 Starting End-to-End API Integration Tests...\n');

const testDir = path.join(os.tmpdir(), `test_e2e_${Date.now()}`);
fs.mkdirSync(testDir, { recursive: true });

process.env.FSS_USER_DATA = testDir;
process.env.PORT = '4567';
process.env.JWT_SECRET = 'test-e2e-secret-key';

const { app, cleanup } = require('../server');
const server = http.createServer(app);

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      if (typeof postData === 'object') {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

server.listen(4567, async () => {
  try {
    // 1. Initial Setup Status (should be false initially)
    const s1 = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/setup/status',
      method: 'GET'
    });
    assert.strictEqual(s1.statusCode, 200);
    assert.strictEqual(s1.json.isSetup, false);
    console.log('  ✅ GET /api/setup/status: Detected fresh installation (isSetup: false)');

    // 2. Initialize Entity Setup
    const initRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/setup/initialize',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      entityName: 'Surf Club Dakar',
      entityAcronym: 'SCD',
      adminPassword: 'Password123!',
      entityEmail: 'contact@dakar.sn'
    });
    assert.strictEqual(initRes.statusCode, 200);
    assert.strictEqual(initRes.json.success, true);
    console.log('  ✅ POST /api/setup/initialize: Configured organization & admin password');

    // 3. Verify Setup Status is now true
    const s2 = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/setup/status',
      method: 'GET'
    });
    assert.strictEqual(s2.json.isSetup, true);
    assert.strictEqual(s2.json.entityName, 'Surf Club Dakar');
    console.log('  ✅ GET /api/setup/status: Returns configured organization info');

    // 4. Test Login with configured password
    const loginRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      password: 'Password123!'
    });
    assert.strictEqual(loginRes.statusCode, 200);
    assert.strictEqual(loginRes.json.success, true);
    const cookies = loginRes.headers['set-cookie'];
    assert(cookies && cookies[0].includes('admin_token='), 'Must set admin_token cookie');
    const authCookie = cookies[0].split(';')[0];
    console.log('  ✅ POST /api/login: Successfully authenticated with new admin password');

    // 5. Test Auth Check
    const meRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/me',
      method: 'GET',
      headers: { 'Cookie': authCookie }
    });
    assert.strictEqual(meRes.statusCode, 200);
    assert.strictEqual(meRes.json.isAuthenticated, true);
    console.log('  ✅ GET /api/me: Session validated via JWT cookie');

    // 6. Test License Creation
    const licRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/licenses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      }
    }, {
      firstName: 'Omar',
      lastName: 'Sy',
      birthDate: '2000-01-01',
      nationality: 'Sénégalaise',
      address: 'Dakar',
      phone: '771234567',
      email: 'omar@surf.sn',
      club: 'Surf Club Dakar',
      category: 'OPEN',
      type: 'Compétition',
      issueDate: '2026-01-01',
      expirationDate: '2026-12-31'
    });
    assert.strictEqual(licRes.statusCode, 201);
    assert(licRes.json.id.startsWith('SCD-2026-'), 'Generated license ID must use custom acronym prefix');
    console.log('  ✅ POST /api/licenses: Created license with prefix:', licRes.json.id);

    // 7. Test License Retrieval
    const listRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/licenses',
      method: 'GET',
      headers: { 'Cookie': authCookie }
    });
    assert.strictEqual(listRes.statusCode, 200);
    assert(Array.isArray(listRes.json) && listRes.json.length === 1);
    console.log('  ✅ GET /api/licenses: Retrieved stored license list');

    // 8. Test Database Backup Export
    const backupRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/backup/download',
      method: 'GET',
      headers: { 'Cookie': authCookie }
    });
    assert.strictEqual(backupRes.statusCode, 200);
    assert.strictEqual(backupRes.headers['content-type'], 'application/octet-stream');
    assert(backupRes.data.length > 0, 'Backup stream must contain database bytes');
    console.log('  ✅ GET /api/backup/download: Streamed complete SQLite snapshot (bytes:', backupRes.data.length, ')');

    // 9. Test Activation Status Endpoint
    const actRes = await request({
      hostname: '127.0.0.1',
      port: 4567,
      path: '/api/activation/status',
      method: 'GET'
    });
    assert.strictEqual(actRes.statusCode, 200);
    assert(typeof actRes.json.valid === 'boolean');
    console.log('  ✅ GET /api/activation/status: Hardware validation check operational');

    console.log('\n🎉 ALL 9 END-TO-END HTTP API TESTS PASSED WITHOUT ERROR!\n');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    cleanup();
    fs.rmSync(testDir, { recursive: true, force: true });
    process.exit(process.exitCode || 0);
  }
});
