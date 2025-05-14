const crypto = require("crypto");

// Encryption key (store in environment variable, rotate regularly)
const ENCRYPTION_KEY = process.env.URL_ENCRYPTION_KEY; // 32 bytes for AES-256
if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, "hex").length !== 32) {
  throw new Error("URL_ENCRYPTION_KEY must be a 32-byte hex string");
}

function encryptId(id) {
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(id, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  // Combine IV, encrypted data, and auth tag (URL-safe)
  return Buffer.from(
    `${iv.toString("base64")}:${encrypted}:${authTag}`
  ).toString("base64url");
}

function decryptId(encryptedId) {
  try {
    const [iv, encrypted, authTag] = Buffer.from(encryptedId, "base64url")
      .toString("utf8")
      .split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Invalid encrypted ID");
  }
}

module.exports = { encryptId, decryptId };
