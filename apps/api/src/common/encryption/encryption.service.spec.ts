import { describe, it, expect, beforeAll } from "vitest";
import { EncryptionService } from "./encryption.service.js";

describe("EncryptionService", () => {
  let service: EncryptionService;

  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY = "test-master-key-32-chars-long-min-length-required";
    service = new EncryptionService();
  });

  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt plaintext correctly", () => {
      const plaintext = "sensitive-data-123";
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it("should return null for null input", () => {
      expect(service.encrypt(null)).toBeNull();
      expect(service.decrypt(null)).toBeNull();
    });

    it("should produce different ciphertexts for same plaintext", () => {
      const plaintext = "test-data";
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(service.decrypt(encrypted1)).toBe(plaintext);
      expect(service.decrypt(encrypted2)).toBe(plaintext);
    });

    it("should handle Vietnamese text correctly", () => {
      const vietnamese = "Nguyễn Văn Anh - 0912345678";
      const encrypted = service.encrypt(vietnamese);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(vietnamese);
    });

    it("should throw on invalid encrypted data", () => {
      expect(() => service.decrypt("invalid-base64-data!!!")).toThrow();
    });
  });

  describe("encryptFields/decryptFields", () => {
    it("should encrypt specified fields in object", () => {
      const user = {
        id: "123",
        name: "John Doe",
        phone: "0912345678",
        email: "john@example.com",
      };

      const encrypted = service.encryptFields(user, ["phone", "email"]);

      expect(encrypted.id).toBe(user.id);
      expect(encrypted.name).toBe(user.name);
      expect(encrypted.phone).not.toBe(user.phone);
      expect(encrypted.email).not.toBe(user.email);

      const decrypted = service.decryptFields(encrypted, ["phone", "email"]);

      expect(decrypted.phone).toBe(user.phone);
      expect(decrypted.email).toBe(user.email);
    });
  });
});
