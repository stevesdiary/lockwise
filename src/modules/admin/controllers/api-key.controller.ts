import { Response } from 'express';
import db from '../../../shared/core/database';
import { QueryTypes } from 'sequelize';
import { encryptionService } from '../../../shared/services/encryption.service';
import { AuthRequest } from '../../auth/middleware/auth.middleware';

export const apiKeyController = {
  async generateKey(req: AuthRequest, res: Response) {
    try {
      const { name, permissions } = req.body;
      const { key, hash } = encryptionService.generateApiKey();

      const [result] = await db.query(`
        INSERT INTO api_keys (name, key_hash, permissions, created_by)
        VALUES (?, ?, ?, ?) RETURNING id, name, permissions, created_at
      `, {
        replacements: [name, hash, permissions, req.user?.id],
        type: QueryTypes.INSERT
      }) as any;

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
      const keys = await db.query(`
        SELECT id, name, permissions, is_active, created_at, last_used
        FROM api_keys WHERE created_by = ? ORDER BY created_at DESC
      `, {
        replacements: [req.user?.id],
        type: QueryTypes.SELECT
      });

      res.json({ keys });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  },

  async revokeKey(req: AuthRequest, res: Response) {
    try {
      const { keyId } = req.params;

      await db.query(`
        UPDATE api_keys SET is_active = false 
        WHERE id = ? AND created_by = ?
      `, {
        replacements: [keyId, req.user?.id]
      });

      res.json({ message: 'API key revoked' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }
};