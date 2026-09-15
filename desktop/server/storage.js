const path = require('path');
const fs = require('fs');
const { PHOTOS_DIR, DOCUMENTS_DIR } = require('./config');

/**
 * Save an uploaded file buffer to the local filesystem.
 * Returns the relative URL path to serve the file.
 */
function savePhoto(buffer, originalName) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName);
  const fileName = `photo-${uniqueSuffix}${ext}`;
  const filePath = path.join(PHOTOS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/photos/${fileName}`;
}

function saveDocument(buffer, originalName) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName);
  const fileName = `document-${uniqueSuffix}${ext}`;
  const filePath = path.join(DOCUMENTS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/documents/${fileName}`;
}

module.exports = {
  savePhoto,
  saveDocument,
};
