/**
 * Generates minimal PNG icons for the PWA manifest.
 * No external dependencies required — pure Node.js with built-in zlib.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 table (used for PNG chunk checksums)
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcVal = crc32(Buffer.concat([typeBytes, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB) {
  const rowStride = 1 + size * 3;
  const raw = Buffer.alloc(size * rowStride, 0);

  for (let y = 0; y < size; y++) {
    const baseOff = y * rowStride;
    raw[baseOff] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const off = baseOff + 1 + x * 3;

      // Rounded corner mask
      const radius = Math.floor(size * 0.15);
      const inCorner =
        (x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius) ||
        (x >= size - radius && y < radius && Math.hypot(x - (size - 1 - radius), y - radius) > radius) ||
        (x < radius && y >= size - radius && Math.hypot(x - radius, y - (size - 1 - radius)) > radius) ||
        (x >= size - radius && y >= size - radius && Math.hypot(x - (size - 1 - radius), y - (size - 1 - radius)) > radius);

      if (inCorner) {
        raw[off] = 255; raw[off + 1] = 255; raw[off + 2] = 255;
        continue;
      }

      // Background
      raw[off] = bgR; raw[off + 1] = bgG; raw[off + 2] = bgB;

      // Draw a bold "A" letter centered in the icon
      const cx = size / 2, cy = size / 2;
      const letterSize = size * 0.45;
      const lx = (x - cx) / letterSize;
      const ly = (y - cy) / letterSize;

      const thickness = 0.07;
      const leftSide  = Math.abs(lx + ly * 0.55 + 0.1) < thickness && ly > -0.5 && ly < 0.48;
      const rightSide = Math.abs(lx - ly * 0.55 - 0.1) < thickness && ly > -0.5 && ly < 0.48;
      const crossbar  = Math.abs(ly + 0.05) < thickness && lx > -0.22 && lx < 0.22;

      if (leftSide || rightSide || crossbar) {
        raw[off] = fgR; raw[off + 1] = fgG; raw[off + 2] = fgB;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 6 });
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    PNG_SIG,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Brand blue #2563eb = rgb(37, 99, 235), white letter
const iconsDir = path.join(__dirname, '..', 'client', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [192, 512]) {
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, createPNG(size, 37, 99, 235, 255, 255, 255));
  console.log(`✓ Generated ${outPath}`);
}
console.log('Done!');
