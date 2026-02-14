import { encryptionService } from '../../src/shared/services/encryption.service';

describe('Encryption Service', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'sensitive data';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
      expect(encrypted).not.toBe(plaintext);
    });

    it('should generate unique encryptions', () => {
      const plaintext = 'test';
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('generateApiKey', () => {
    it('should generate unique API keys', () => {
      const key1 = encryptionService.generateApiKey();
      const key2 = encryptionService.generateApiKey();
      
      expect(key1.key).not.toBe(key2.key);
      expect(key1.hash).not.toBe(key2.hash);
      expect(key1.key).toHaveLength(64);
    });
  });
});