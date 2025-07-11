import { Redis } from 'ioredis';

let redisInstance: Redis | null = null;
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

async function getRedis(): Promise<Redis> {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
  }

  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: MAX_RETRIES,
      retryStrategy: times => (times > MAX_RETRIES ? null : Math.min(times * RETRY_DELAY, 1000)),
      reconnectOnError: err => err.message.includes('READONLY'),
    });

    redisInstance.on('connect', () => console.log('Connected to Redis'));
    redisInstance.on('error', err => console.error('Redis error:', err));
  }

  return redisInstance;
}

export async function saveToRedis(key: string, value: string, expirationInSeconds: number): Promise<void> {
  const redis = await getRedis();
  await redis.set(key, value, 'EX', expirationInSeconds);
}

export async function getFromRedis(key: string): Promise<string | null> {
  const redis = await getRedis();
  return redis.get(key);
}

export async function deleteFromRedis(key: string): Promise<void> {
  const redis = await getRedis();
  await redis.del(key);
}


// import { Redis } from 'ioredis';

// class RedisConnection {
//   private static instance: Redis | null = null;
//   private static readonly MAX_RETRIES = 3;
//   private static readonly RETRY_DELAY = 1000;

//   static async getInstance(): Promise<Redis> {
//     if (!process.env.REDIS_URL) {
//       throw new Error('REDIS_URL environment variable is required');
//     }

//     if (!this.instance) {
//       this.instance = new Redis(process.env.REDIS_URL, {
//         maxRetriesPerRequest: this.MAX_RETRIES,
//         retryStrategy: (times: number) => {
//           if (times > this.MAX_RETRIES) {
//             return null; // stop retrying
//           }
//           return Math.min(times * this.RETRY_DELAY, 3000);
//         },
//         reconnectOnError: (err: Error) => {
//           const targetError = 'READONLY';
//           return err.message.includes(targetError);
//         }
//       });

//       this.instance.on('connect', () => {
//         console.log('Successfully connected to Redis');
//       });

//       this.instance.on('error', (err: Error) => {
//         console.error('Redis connection error:', err);
//       });
//     }

//     return this.instance;
//   }

//     static async saveToRedis(key: string, value: string, expirationInSeconds: number): Promise<void> {
//     const redis = await this.getInstance();
    
//     try {
//       await redis.set(key, value, 'EX', expirationInSeconds);
//       console.log(`Successfully saved ${key} to Redis`);
//     } catch (err) {
//       console.error('Error saving to Redis:', err);
//       throw err;
//     }
//   }

//   static async getFromRedis(key: string): Promise<string | null> {
//     const redis = await this.getInstance();
    
//     try {
//       const value = await redis.get(key);
//       if (value) {
//         console.log(`Successfully retrieved ${key} from Redis`);
//       }
//       return value;
//     } catch (err) {
//       console.error('Error retrieving from Redis:', err);
//       throw err;
//     }
//   }

//   static async deleteFromRedis(key: string): Promise<void> {
//     const redis = await this.getInstance();
    
//     try {
//       await redis.del(key);
//       console.log(`Successfully deleted ${key} from Redis`);
//     } catch (err) {
//       console.error('Error deleting from Redis:', err);
//       throw err;
//     }
//   }
// }

// export default RedisConnection;