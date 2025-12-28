import { Response } from 'express';
import { db } from '../core/database.optimized';
import { encryptionService } from '../services/encryption.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const apiKeyController = {
  async generateKey(req: AuthRequest, res: Response) {
    try {
      const { name, permissions } = req.body;
      const { key, hash } = encryptionService.generateApiKey();

      const result = await db.one(`
        INSERT INTO api_keys (name, key_hash, permissions, created_by)
        VALUES ($1, $2, $3, $4) RETURNING id, name, permissions, created_at
      `, [name, hash, permissions, req.user?.id]);

      res.json({
        message: 'API key generated',
        apiKey: key,
        keyInfo: result
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  },

  async listKeys(req: AuthRequest, res: Response) {
    try {
      const keys = await db.any(`
        SELECT id, name, permissions, is_active, created_at, last_used
        FROM api_keys WHERE created_by = $1 ORDER BY created_at DESC
      `, [req.user?.id]);

      res.json({ keys });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  },

  async revokeKey(req: AuthRequest, res: Response) {
    try {
      const { keyId } = req.params;

      await db.none(`
        UPDATE api_keys SET is_active = false 
        WHERE id = $1 AND created_by = $2
      `, [keyId, req.user?.id]);

      res.json({ message: 'API key revoked' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }
};