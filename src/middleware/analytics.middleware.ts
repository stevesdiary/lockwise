import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from './auth.middleware';

interface AnalyticsRequest extends AuthRequest {
  startTime?: number;
}

export const analyticsMiddleware = (eventName?: string) => {
  return async (req: AnalyticsRequest, res: Response, next: NextFunction) => {
    req.startTime = Date.now();

    const originalSend = res.send;
    res.send = function(data) {
      trackAnalytics(req, res, eventName);
      return originalSend.call(this, data);
    };

    next();
  };
};

const trackAnalytics = async (req: AnalyticsRequest, res: Response, eventName?: string) => {
  if (!req.user) return;

  try {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const event = eventName || getEventFromPath(req.path, req.method);
    
    const properties = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    await analyticsService.trackEvent(req.user.id, event, properties);
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

const getEventFromPath = (path: string, method: string): string => {
  const pathMap: Record<string, string> = {
    '/login': 'login',
    '/logout': 'logout',
    '/register': 'register',
    '/access-code': 'access_code_generated',
    '/payment': 'payment_initiated',
    '/profile': 'profile_viewed',
    '/dashboard': 'dashboard_viewed'
  };

  for (const [route, event] of Object.entries(pathMap)) {
    if (path.includes(route)) {
      return `${event}_${method.toLowerCase()}`;
    }
  }

  return `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
};