const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { validateLicense } = require('./server/hwid');

// Keep a global reference to prevent garbage collection
let mainWindow = null;
let server = null;

const SERVER_PORT = 3456;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Licences Manager',
    icon: path.join(__dirname, 'build', 'icon_512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#020617',
    titleBarStyle: 'hiddenInset',
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Load the app from the local Express server
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      // Set environment variables before loading the server
      process.env.PORT = String(SERVER_PORT);
      process.env.FSS_DESKTOP = '1';
      process.env.FSS_USER_DATA = app.getPath('userData');

      server = require('./server');
      const expressApp = server.app;
      const httpServer = expressApp.listen(SERVER_PORT, () => {
        console.log(`🚀 Licences Manager Desktop Server running on http://localhost:${SERVER_PORT}`);
        resolve();
      });

      httpServer.on('error', (err) => {
        console.error('Server error:', err);
        reject(err);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      reject(err);
    }
  });
}

app.whenReady().then(async () => {
  try {
    const userDataPath = app.getPath('userData');
    const licensePath = path.join(userDataPath, '.license');
    const validation = validateLicense(licensePath);

    if (!validation.valid) {
      dialog.showErrorBox(
        'Licence Non Valide',
        validation.reason || 'Cette installation de Licences Manager est verrouillée pour une autre machine physique.'
      );
      app.quit();
      return;
    }

    await startServer();
    createWindow();
  } catch (err) {
    console.error('Failed to initialize:', err);
    dialog.showErrorBox('Erreur de démarrage', `Impossible de lancer l'application : ${err.message}`);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup
  if (server && server.cleanup) {
    server.cleanup();
  }
});
