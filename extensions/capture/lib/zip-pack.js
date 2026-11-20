/**
 * Minimal ZIP (STORE only — no recompress). Ideal for JPEG/MP4 already compressed;
 * packs JSON + media into one local archive without a heavy dependency.
 */
(function (global) {
  "use strict";

  function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
      }
    }
    return ~c >>> 0;
  }

  function u16(n) {
    const b = new Uint8Array(2);
    b[0] = n & 255;
    b[1] = (n >>> 8) & 255;
    return b;
  }

  function u32(n) {
    const b = new Uint8Array(4);
    b[0] = n & 255;
    b[1] = (n >>> 8) & 255;
    b[2] = (n >>> 16) & 255;
    b[3] = (n >>> 24) & 255;
    return b;
  }

  function concat(parts) {
    let len = 0;
    for (const p of parts) len += p.length;
    const out = new Uint8Array(len);
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  }

  function encodeName(name) {
    return new TextEncoder().encode(name.replace(/\\/g, "/"));
  }

  /**
   * @param {Record<string, Uint8Array>} files path → bytes
   * @returns {Uint8Array} zip bytes
   */
  function packStore(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const entries = Object.keys(files).sort();

    for (const name of entries) {
      const data = files[name];
      const nameBytes = encodeName(name);
      const crc = crc32(data);
      const size = data.length;

      const localHeader = concat([
        u32(0x04034b50),
        u16(20),
        u16(0),
        u16(0), // method STORE
        u16(0),
        u16(0),
        u32(crc),
        u32(size),
        u32(size),
        u16(nameBytes.length),
        u16(0),
        nameBytes,
      ]);
      localParts.push(localHeader, data);

      const central = concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(size),
        u32(size),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ]);
      centralParts.push(central);
      offset += localHeader.length + data.length;
    }

    const centralDir = concat(centralParts);
    const end = concat([
      u32(0x06054b50),
      u16(0),
      u16(0),
      u16(entries.length),
      u16(entries.length),
      u32(centralDir.length),
      u32(offset),
      u16(0),
    ]);
    return concat([...localParts, centralDir, end]);
  }

  global.MyProblemZip = { packStore, crc32 };
})(typeof globalThis !== "undefined" ? globalThis : self);
