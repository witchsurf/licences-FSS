// Simple PNG to ICO converter
const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'public', 'logo.png');
const icoPath = path.join(__dirname, 'build', 'icon.ico');

const pngData = fs.readFileSync(pngPath);

// Read PNG dimensions from IHDR chunk
const width = pngData.readUInt32BE(16);
const height = pngData.readUInt32BE(20);

console.log(`PNG: ${width}x${height}, size: ${pngData.length} bytes`);

// ICO format:
// - ICONDIR header (6 bytes)
// - ICONDIRENTRY (16 bytes per image)
// - Image data (PNG embedded)

const numImages = 1;
const headerSize = 6;
const entrySize = 16;
const dataOffset = headerSize + (entrySize * numImages);

const ico = Buffer.alloc(dataOffset + pngData.length);

// ICONDIR
ico.writeUInt16LE(0, 0);      // Reserved
ico.writeUInt16LE(1, 2);      // Type: 1 = ICO
ico.writeUInt16LE(numImages, 4); // Number of images

// ICONDIRENTRY
ico.writeUInt8(width >= 256 ? 0 : width, 6);   // Width (0 = 256)
ico.writeUInt8(height >= 256 ? 0 : height, 7);  // Height (0 = 256)
ico.writeUInt8(0, 8);          // Color palette
ico.writeUInt8(0, 9);          // Reserved
ico.writeUInt16LE(1, 10);      // Color planes
ico.writeUInt16LE(32, 12);     // Bits per pixel
ico.writeUInt32LE(pngData.length, 14); // Size of image data
ico.writeUInt32LE(dataOffset, 18);     // Offset to image data

// Copy PNG data
pngData.copy(ico, dataOffset);

fs.writeFileSync(icoPath, ico);
console.log(`ICO written to ${icoPath} (${ico.length} bytes)`);
