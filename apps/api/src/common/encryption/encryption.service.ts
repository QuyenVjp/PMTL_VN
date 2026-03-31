import { Injectable, Logger } from "@nestjs/common";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Encryption service for column-level PII protection (PDPA NĐ 13/2023).
 * Algorithm: AES-256-GCM with scrypt-derived DEK.
 *
 * Key derivation: scrypt runs ONCE at startup with a fixed application salt
 * to produce a stable Data Encryption Key (DEK). Per-encryption randomness
 * comes from the 12-byte GCM nonce — not from re-running scrypt each call.
 * This gives full AES-GCM security without ~100ms/call scrypt overhead.
 *
 * Wire format: base64( nonce[12] | authTag[16] | ciphertext[n] )
 * Env: ENCRYPTION_MASTER_KEY (generate: openssl rand -hex 32)
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: string;
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32;
  private readonly ivLength = 12;   // GCM standard nonce: 96 bits
  private readonly tagLength = 16;

  // DEK cached after first derivation — scrypt runs once per process lifetime
  private derivedKey: Buffer | null = null;

  // Fixed application salt — unique per project, never changes after deploy.
  // Changing this salt invalidates all existing ciphertext in the DB.
  private readonly APP_SALT = Buffer.from("pmtl-pii-aes256gcm-v1", "utf8");

  constructor() {
    this.masterKey = process.env.ENCRYPTION_MASTER_KEY || "";

    if (!this.masterKey || this.masterKey.length < 32) {
      throw new Error(
        "ENCRYPTION_MASTER_KEY must be set (min 32 chars). Generate with: openssl rand -hex 32",
      );
    }
  }

  private getDEK(): Buffer {
    if (this.derivedKey) return this.derivedKey;
    // N=32768, r=8, p=1 — OWASP recommended minimum for scrypt.
    // scryptSync blocks once at first call (startup); all subsequent calls return cached key.
    // N=32768, r=8, p=1 — OWASP minimum; maxmem raised because 128*N*r = 32MB exactly
    // hits Node's default 32MB ceiling. Explicit 64MB avoids the boundary failure.
    this.derivedKey = scryptSync(this.masterKey, this.APP_SALT, this.keyLength, {
      N: 32768, r: 8, p: 1, maxmem: 67108864,
    }) as Buffer;
    return this.derivedKey;
  }

  /**
   * Encrypt plaintext. Returns base64(nonce[12] | authTag[16] | ciphertext).
   */
  async encrypt(plaintext: string | null): Promise<string | null> {
    if (!plaintext) return null;
    try {
      const key = this.getDEK();
      const iv = randomBytes(this.ivLength);
      const cipher = createCipheriv(this.algorithm, key, iv);
      const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
      const authTag = cipher.getAuthTag();
      return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
    } catch (error) {
      this.logger.error({ msg: "encryption.failed", error: (error as Error).message });
      throw new Error("Encryption failed");
    }
  }

  /**
   * Decrypt ciphertext. Expects base64(nonce[12] | authTag[16] | ciphertext).
   */
  async decrypt(encrypted: string | null): Promise<string | null> {
    if (!encrypted) return null;
    try {
      const key = this.getDEK();
      const buf = Buffer.from(encrypted, "base64");
      const iv = buf.subarray(0, this.ivLength);
      const authTag = buf.subarray(this.ivLength, this.ivLength + this.tagLength);
      const ciphertext = buf.subarray(this.ivLength + this.tagLength);
      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    } catch (error) {
      this.logger.error({ msg: "decryption.failed", error: (error as Error).message });
      throw new Error("Decryption failed - data may be corrupted");
    }
  }

  async encryptFields<T extends Record<string, unknown>>(
    obj: T,
    fields: Array<keyof T>
  ): Promise<T> {
    const result = { ...obj };
    for (const field of fields) {
      const value = obj[field];
      if (typeof value === "string") {
        result[field] = (await this.encrypt(value)) as T[keyof T];
      }
    }
    return result;
  }

  async decryptFields<T extends Record<string, unknown>>(
    obj: T,
    fields: Array<keyof T>
  ): Promise<T> {
    const result = { ...obj };
    for (const field of fields) {
      const value = obj[field];
      if (typeof value === "string") {
        result[field] = (await this.decrypt(value)) as T[keyof T];
      }
    }
    return result;
  }
}
