import crypto from "crypto";

function getKey() {
  const raw = process.env.GOOGLE_ADS_ENCRYPTION_KEY;
  if (!raw) throw new Error("GOOGLE_ADS_ENCRYPTION_KEY is missing");
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) throw new Error("GOOGLE_ADS_ENCRYPTION_KEY must be a 64-character hex value");
  return key;
}

export function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptSecret(payload) {
  const [ivPart, tagPart, encryptedPart] = String(payload || "").split(".");
  if (!ivPart || !tagPart || !encryptedPart) throw new Error("Invalid encrypted secret");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
