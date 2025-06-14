const crypto = require("crypto");

// Encryption key (store in environment variable, rotate regularly)
const ENCRYPTION_KEY = process.env.URL_ENCRYPTION_KEY; // 32 bytes for AES-256
if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, "hex").length !== 32) {
  throw new Error("URL_ENCRYPTION_KEY must be a 32-byte hex string");
}

function encryptId(id) {
  return Buffer.from(id).toString('base64url');
}

function decryptId(encryptedId) {
  try {
    return Buffer.from(encryptedId, 'base64url').toString('utf8');
  } catch (error) {
    throw new Error('Invalid ID');
  }
}

module.exports = { encryptId, decryptId };
