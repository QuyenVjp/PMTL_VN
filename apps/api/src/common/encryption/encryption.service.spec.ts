import { describe, it, expect, beforeAll } from "vitest";
import { EncryptionService } from "./encryption.service.js";

describe("EncryptionService", () => {
  let service: EncryptionService;

  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY = "test-master-key-32-chars-long-min-length-required";
    service = new EncryptionService();
  });

  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt plaintext correctly", async () => {
      const plaintext = "sensitive-data-123";
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should return null for null input", async () => {
      expect(await service.encrypt(null)).toBeNull();
      expect(await service.decrypt(null)).toBeNull();
    });

    it("should produce different ciphertexts for same plaintext", async () => {
      const plaintext = "test-data";
      const encrypted1 = await service.encrypt(plaintext);
      const encrypted2 = await service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(await service.decrypt(encrypted1)).toBe(plaintext);
      expect(await service.decrypt(encrypted2)).toBe(plaintext);
    });

    it("should handle Vietnamese text correctly", async () => {
      const vietnamese = "Nguyễn Văn Anh - 0912345678";
      const encrypted = await service.encrypt(vietnamese);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(vietnamese);
    });

    it("should throw on invalid encrypted data", async () => {
      await expect(service.decrypt("invalid-base64-data!!!")).rejects.toThrow();
    });
  });

  describe("encryptFields/decryptFields", () => {
    it("should encrypt specified fields in object", async () => {
      const user = {
        id: "123",
        name: "John Doe",
        phone: "0912345678",
        email: "john@example.com",
      };

      const encrypted = await service.encryptFields(user, ["phone", "email"]);

      expect(encrypted.id).toBe(user.id);
      expect(encrypted.name).toBe(user.name);
      expect(encrypted.phone).not.toBe(user.phone);
      expect(encrypted.email).not.toBe(user.email);

      const decrypted = await service.decryptFields(encrypted, ["phone", "email"]);

      expect(decrypted.phone).toBe(user.phone);
      expect(decrypted.email).toBe(user.email);
    });
  });
});
