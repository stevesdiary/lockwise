import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import sequelize from '../core/database';
import { QueryTypes } from 'sequelize';

interface ApiKeyRequest extends Request {
  apiKey?: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export const validateApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const [results] = await sequelize.query(
      'SELECT id, name, permissions, is_active FROM api_keys WHERE key_hash = $1 AND is_active = true',
      {
        bind: [hashedKey],
        type: QueryTypes.SELECT
      }
    );

    const keyData = results as any;

    if (!keyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    await sequelize.query('UPDATE api_keys SET last_used = NOW() WHERE id = $1', {
      bind: [keyData.id],
      type: QueryTypes.UPDATE
    });

    req.apiKey = {
      id: keyData.id,
      name: keyData.name,
      permissions: keyData.permissions || []
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'API key validation failed' });
  }
};

export const requirePermission = (permission: string) => {
  return (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey?.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient API permissions' });
    }
    next();
  };
};

export { ApiKeyRequest };