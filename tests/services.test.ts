import { encryptionService } from '../src/services/encryption.service';
import { analyticsService } from '../src/services/analytics.service';

describe('Encryption Service', () => {
  it('should encrypt and decrypt text correctly', () => {
    const plaintext = 'sensitive data';
    const encrypted = encryptionService.encrypt(plaintext);
    const decrypted = encryptionService.decrypt(encrypted);
    
    expect(decrypted).toBe(plaintext);
    expect(encrypted).not.toBe(plaintext);
  });

  it('should generate unique API keys', () => {
    const key1 = encryptionService.generateApiKey();
    const key2 = encryptionService.generateApiKey();
    
    expect(key1.key).not.toBe(key2.key);
    expect(key1.hash).not.toBe(key2.hash);
  });
});

describe('Analytics Service', () => {
  it('should track events', async () => {
    const userId = 'test-user-id';
    const event = 'test_event';
    const properties = { test: 'data' };
    
    await expect(analyticsService.trackEvent(userId, event, properties))
      .resolves.not.toThrow();
  });

  it('should get usage stats', async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';
    
    const stats = await analyticsService.getUsageStats(startDate, endDate);
    
    expect(stats).toHaveProperty('active_users');
    expect(stats).toHaveProperty('total_events');
  });
});