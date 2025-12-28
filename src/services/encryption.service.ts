import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = crypto.scryptSync(
  process.env.ENCRYPTION_KEY || "default-key",
  "salt",
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
    return crypto
      .pbkdf2Sync(password, process.env.SALT || "salt", 10000, 64, "sha512")
      .toString("hex");
  },

  generateApiKey(): { key: string; hash: string } {
    const key = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    return { key, hash };
  },
};
