import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function saveToRedis(key: string, value: string, expirationInSeconds: number): Promise<void> {
  await redis.set(key, value, { ex: expirationInSeconds });
}

export async function getFromRedis(key: string): Promise<string | null> {
  return redis.get<string>(key);
}

export async function deleteFromRedis(key: string): Promise<void> {
  await redis.del(key);
}

export default redis;
