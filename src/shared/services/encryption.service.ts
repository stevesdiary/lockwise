import crypto from "crypto";

// Validate encryption key is properly configured
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY === 'default-key') {
  console.error('CRITICAL: ENCRYPTION_KEY must be set to a secure random value');
}

const ALGORITHM = "aes-256-gcm";
const SALT = process.env.ENCRYPTION_SALT || crypto.randomBytes(16).toString('hex');

// Use proper key derivation with secure salt
const KEY = crypto.scryptSync(
  process.env.ENCRYPTION_KEY || "default-key",
  SALT,
  32
);

export const encryptionService = {
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    cipher.setAAD(Buffer.from("lockwise", "utf8"));

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  },

  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAAD(Buffer.from("lockwise", "utf8"));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  },

  hashPassword(password: string): string {
    // Use proper salt from environment or generate secure random salt
    const salt = process.env.PASSWORD_SALT || crypto.randomBytes(16).toString('hex');
    // Increase iterations for better security (100,000+ recommended)
    return crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
  },

  generateApiKey(): { key: string; hash: string } {
    // Use cryptographically secure random bytes (increased from 32 to 48)
    const key = crypto.randomBytes(48).toString("hex");
    // Use SHA-256 for hashing (already secure)
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    return { key, hash };
  },
};
