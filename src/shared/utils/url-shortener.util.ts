import { customAlphabet } from 'nanoid';
import { saveToRedis, getFromRedis, deleteFromRedis } from '../core/redis';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8);

const DEFAULT_TTL = 10 * 24 * 60 * 60; // 10 days

export const createShortUrl = async (originalUrl: string, accessLogId?: string, ttlSeconds = DEFAULT_TTL): Promise<string> => {
  const slug = nanoid();
  await saveToRedis(`url_short:${slug}`, originalUrl, ttlSeconds);
  if (accessLogId) {
    // Reverse mapping so we can nullify the link when the access code is revoked
    await saveToRedis(`url_short_by_log:${accessLogId}`, slug, ttlSeconds);
  }
  const baseUrl = (process.env.BASE_URL || 'https://api.lockwise.app').replace(/\/$/, '');
  return `${baseUrl}/s/${slug}`;
};

export const resolveShortUrl = async (slug: string): Promise<string | null> => {
  return getFromRedis<string>(`url_short:${slug}`);
};

// Returns existing short URL for this access log if already created, otherwise creates one.
// Prevents duplicate slugs when user taps share multiple times.
export const getOrCreateShortUrl = async (originalUrl: string, accessLogId: string, ttlSeconds = DEFAULT_TTL): Promise<string> => {
  const baseUrl = (process.env.BASE_URL || 'https://api.lockwise.app').replace(/\/$/, '');
  const existingSlug = await getFromRedis<string>(`url_short_by_log:${accessLogId}`);
  if (existingSlug) return `${baseUrl}/s/${existingSlug}`;
  return createShortUrl(originalUrl, accessLogId, ttlSeconds);
};

export const nullifyShortUrlForLog = async (accessLogId: string): Promise<void> => {
  const slug = await getFromRedis<string>(`url_short_by_log:${accessLogId}`);
  if (slug) {
    await deleteFromRedis(`url_short:${slug}`);
    await deleteFromRedis(`url_short_by_log:${accessLogId}`);
  }
};
