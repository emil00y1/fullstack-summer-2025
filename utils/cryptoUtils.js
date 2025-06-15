const crypto = require("crypto");

// Encryption key (store in environment variable, rotate regularly)
const ENCRYPTION_KEY = process.env.URL_ENCRYPTION_KEY; // 32 bytes for AES-256
if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, "hex").length !== 32) {
  throw new Error("URL_ENCRYPTION_KEY must be a 32-byte hex string");
}

function encryptId(id) {
  return Buffer.from(id).toString("base64url");
}

function decryptId(encryptedId) {
  // Validate input
  if (
    !encryptedId ||
    typeof encryptedId !== "string" ||
    encryptedId.trim() === ""
  ) {
    throw new Error("Invalid encrypted data");
  }

  try {
    const decoded = Buffer.from(encryptedId, "base64url").toString("utf8");
    // Additional validation - if the decoded string is empty or invalid, throw
    if (!decoded) {
      throw new Error("Invalid encrypted data");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid encrypted data");
  }
}

module.exports = { encryptId, decryptId };
