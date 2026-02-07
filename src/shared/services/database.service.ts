import { Pool } from 'pg';

class DatabaseService {
  private pool: Pool;
  private queryCache = new Map<string, any>();

  constructor() {
    this.pool = new Pool({
      host: process.env.DEV_DB_HOST,
      port: parseInt(process.env.DEV_DB_PORT || '5432'),
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      ssl: process.env.SSL === 'true',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(text: string, params?: any[], useCache = false) {
    const cacheKey = `${text}:${JSON.stringify(params)}`;
    
    if (useCache && this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      
      if (useCache) {
        this.queryCache.set(cacheKey, result);
        setTimeout(() => this.queryCache.delete(cacheKey), 300000);
      }
      
      return result;
    } finally {
      client.release();
    }
  }

  async batchQuery(queries: Array<{text: string, params?: any[]}>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getHealthStatus() {
    try {
      const result = await this.query('SELECT NOW() as timestamp');
      return { status: 'healthy', timestamp: result.rows[0].timestamp };
    } catch (error: any) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async close() {
    await this.pool.end();
  }
}

export const dbService = new DatabaseService();