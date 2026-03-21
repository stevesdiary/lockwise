import 'dotenv/config';

import dns from 'dns/promises';
import net from 'net';
import { Client, ClientConfig } from 'pg';

type ConfigSource = 'discrete' | 'url';

type DiagnosticConfig = {
  source: ConfigSource;
  host: string;
  port: number;
  database: string;
  username: string;
  sslEnabled: boolean;
  connectionLabel: string;
  clientConfig: ClientConfig;
};

const getDatabaseConfig = (): DiagnosticConfig => {
  const rawDatabaseUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DB_HOST ?? process.env.DEV_DB_HOST;
  const dbPort = Number(process.env.DB_PORT ?? process.env.DEV_DB_PORT ?? '5432');
  const dbName = process.env.DB_NAME ?? process.env.DEV_DB_NAME;
  const dbUser = process.env.DB_USER ?? process.env.DEV_DB_USER;
  const dbPassword = process.env.DB_PASSWORD ?? process.env.DEV_DB_PASSWORD;
  const dbSslEnabled = (process.env.DB_SSL ?? process.env.SSL ?? 'true') === 'true';

  if (dbHost && dbName && dbUser && dbPassword) {
    return {
      source: 'discrete',
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbUser,
      sslEnabled: dbSslEnabled,
      connectionLabel: `${dbHost}:${dbPort}/${dbName}`,
      clientConfig: {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        password: dbPassword,
        connectionTimeoutMillis: 5_000,
        ssl: dbSslEnabled
          ? {
              rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
              minVersion: 'TLSv1.2',
              ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
            }
          : false,
      },
    };
  }

  if (!rawDatabaseUrl) {
    throw new Error(
      'Database configuration is required. Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, and DB_SSL or DATABASE_URL.',
    );
  }

  const parsed = new URL(rawDatabaseUrl);
  if (parsed.searchParams.get('sslmode') === 'require') {
    parsed.searchParams.set('sslmode', 'verify-full');
  }

  return {
    source: 'url',
    host: parsed.hostname,
    port: Number(parsed.port || '5432'),
    database: parsed.pathname.replace(/^\//, '') || 'postgres',
    username: decodeURIComponent(parsed.username),
    sslEnabled: true,
    connectionLabel: `${parsed.hostname}:${parsed.port || '5432'}/${parsed.pathname.replace(/^\//, '') || 'postgres'}`,
    clientConfig: {
      connectionString: parsed.toString(),
      connectionTimeoutMillis: 5_000,
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
        minVersion: 'TLSv1.2',
        ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
      },
    },
  };
};

const probeTcp = async (host: string, port: number): Promise<'connected' | 'timeout'> => {
  await new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(5_000);

    socket.once('connect', () => {
      socket.destroy();
      resolve();
    });

    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error('timeout'));
    });

    socket.once('error', (error) => {
      socket.destroy();
      reject(error);
    });
  });

  return 'connected';
};

const main = async (): Promise<void> => {
  const config = getDatabaseConfig();

  console.log(`Config source: ${config.source}`);
  console.log(`Target: ${config.connectionLabel}`);
  console.log(`User: ${config.username}`);
  console.log(`SSL enabled: ${config.sslEnabled}`);

  try {
    const addresses = await dns.lookup(config.host, { all: true });
    console.log('DNS lookup: ok');
    console.log(JSON.stringify(addresses, null, 2));
  } catch (error) {
    console.error('DNS lookup: failed');
    console.error(error);
    process.exitCode = 1;
    return;
  }

  try {
    const tcpResult = await probeTcp(config.host, config.port);
    console.log(`TCP connect: ${tcpResult}`);
  } catch (error) {
    console.error('TCP connect: failed');
    console.error(error);
    process.exitCode = 1;
    return;
  }

  const client = new Client(config.clientConfig);

  try {
    await client.connect();
    console.log('Postgres connect: ok');
  } catch (error) {
    console.error('Postgres connect: failed');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
};

void main();
