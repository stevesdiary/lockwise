import { Request, Response, NextFunction } from 'express';
import sequelize from '../core/database.optimized';
import { QueryTypes } from 'sequelize';
import { AuthRequest } from './auth.middleware';

interface AuditRequest extends AuthRequest {
  startTime?: number;
}

export const auditLogger = (req: AuditRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    logAuditEvent(req, res, data);
    return originalSend.call(this, data);
  };

  next();
};

const logAuditEvent = async (req: AuditRequest, res: Response, responseData: any) => {
  try {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, method, path, status_code, ip_address, 
        user_agent, duration_ms, request_body, response_body
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, {
      bind: [
        req.user?.id || null,
        req.method,
        req.path,
        res.statusCode,
        req.ip,
        req.get('User-Agent'),
        duration,
        JSON.stringify(sanitizeBody(req.body)),
        JSON.stringify(sanitizeResponse(responseData))
      ],
      type: QueryTypes.INSERT
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

const sanitizeBody = (body: any) => {
  if (!body) return null;
  const sanitized = { ...body };
  ['password', 'token', 'secret'].forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  return sanitized;
};

const sanitizeResponse = (data: any) => {
  if (!data) return null;
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (parsed.token) parsed.token = '[REDACTED]';
    if (parsed.refreshToken) parsed.refreshToken = '[REDACTED]';
    return parsed;
  } catch {
    return '[INVALID_JSON]';
  }
};