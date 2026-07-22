import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';

const env = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
console.log(`Environment: ${env}`);

import fs from 'fs';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Umzug, SequelizeStorage } from 'umzug';

// ── Models ────────────────────────────────────────────────────────────────────
import { User }            from '../../modules/auth/models/user.model';
import { Role }            from '../../modules/auth/models/role.model';
import { Permission }      from '../../modules/auth/models/permission.model';
import { RolePermission }  from '../../modules/auth/models/role.permission.model';

import { Estate }          from '../../modules/estate/models/estate.model';
import { Resident }        from '../../modules/estate/models/resident.model';
import { Street }          from '../../modules/estate/models/street.model';
import { Unit }            from '../../modules/estate/models/unit.model';
import { Gate }            from '../../modules/estate/models/gate.model';

import { Address }         from '../../modules/location/models/address.model';

import { Payment }         from '../../modules/payment/models/payment.model';
import { Plan }            from '../../modules/payment/models/plan.model';
import { Referrer }        from '../../modules/payment/models/referrer.model';
import { ReferralBonus }   from '../../modules/payment/models/referral.bonus.model';
import { Subscription }    from '../../modules/payment/models/subscription.model';
import { SubscriptionEvent } from '../../modules/payment/models/subscription-event.model';

import { CommunityMessage } from '../../modules/community/models/community-message.model';
import { MessageReaction }  from '../../modules/community/models/message-reaction.model';
import { Notification }     from '../../modules/communication/models/notification.model';
import { EmergencyAlert, EmergencyContact } from '../../modules/communication/models/emergency.model';
import { EmergencyContactCategory, Country, State, City, LocationEmergencyContact } from '../../modules/communication/models/location-emergency.model';
// UserDevice uses plain sequelize .init() — self-registers on import in its service

import { NFCCard }          from '../../modules/access/models/nfc-card.model';
import { NFCAccessLog }     from '../../modules/access/models/nfc-access-log.model';
// AccessCode, AccessEntry, AccessLog use plain sequelize .init() — self-register on import

import { Amenity }          from '../../modules/amenities/models/amenity.model';
import { Reservation }      from '../../modules/amenities/models/reservation.model';

import { ParkingSlot }         from '../../modules/parking/models/parking-slot.model';
import { ParkingAssignment }   from '../../modules/parking/models/parking-assignment.model';
import { GuestParking }        from '../../modules/parking/models/guest-parking.model';
import { EVChargingSession }   from '../../modules/parking/models/ev-charging-session.model';

import { CommunityPost, CommunityComment } from '../../modules/community/models/community.board.model';
import { Faq }             from '../../modules/community/models/faq.model';

import { SupportTicket, SupportMessage } from '../../modules/support/models/support.model';
import { BillTransaction } from '../../modules/bills/models/bill-transaction.model';
import { Wallet, WalletTransaction } from '../../modules/wallet/models/wallet.model';
import { EstateWallet, EstateWalletTransaction } from '../../modules/kuda/models/estate-wallet.model';

import { SmartMeter }                    from '../../modules/electricity/models/smart-meter.model';
import { ElectricityTransactionRecord }  from '../../modules/electricity/models/electricity-transaction.model';

import { EstateFee, EstateInvoice, EstateWithdrawal } from '../../modules/collections/models/collections.model';
import { FileUpload } from '../../modules/upload/models/file-upload.model';
import { attachSequelizeObservability } from '../observability/sequelize-hooks';

type AppEnvironment = 'development' | 'production' | 'test';

// ── Runtime config (single source for app + migrations) ──────────────────────
const isProduction = env === 'production';
const rawDatabaseUrl = process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST ?? process.env.DEV_DB_HOST;
const dbPort = Number(process.env.DB_PORT ?? process.env.DEV_DB_PORT ?? '5432');
const dbName = process.env.DB_NAME ?? process.env.DEV_DB_NAME;
const dbUser = process.env.DB_USER ?? process.env.DEV_DB_USER;
const dbPassword = process.env.DB_PASSWORD ?? process.env.DEV_DB_PASSWORD;
const dbSslEnabled = (process.env.DB_SSL ?? process.env.SSL ?? 'true') === 'true';
const dbConnectTimeoutMs = Number(
  process.env.DB_CONNECTION_TIMEOUT_MS ?? process.env.PGCONNECT_TIMEOUT ?? '30000',
);

const hasDatabaseUrl = Boolean(rawDatabaseUrl);
const hasDiscreteDbConfig = Boolean(dbHost && dbName && dbUser && dbPassword);

if (!hasDatabaseUrl && !hasDiscreteDbConfig) {
  throw new Error(
    'Database configuration is required. Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, and DB_SSL or DATABASE_URL.',
  );
}

const databaseUrl = (() => {
  if (!rawDatabaseUrl) {
    return null;
  }

  const parsedDatabaseUrl = new URL(rawDatabaseUrl);
  if (parsedDatabaseUrl.searchParams.get('sslmode') === 'require') {
    parsedDatabaseUrl.searchParams.set('sslmode', 'verify-full');
  }

  return parsedDatabaseUrl.toString();
})();

const databaseTarget = hasDatabaseUrl
  ? (() => {
      const { hostname, port, pathname } = new URL(databaseUrl as string);
      const databaseName = pathname.replace(/^\//, '') || 'postgres';

      return `${hostname}:${port || '5432'}/${databaseName}`;
    })()
  : `${dbHost}:${dbPort}/${dbName}`;

const dialectOptions = {
  connectionTimeoutMillis: dbConnectTimeoutMs,
  ...(dbSslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
          minVersion: 'TLSv1.2',
          ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
        },
      }
    : {}),
};

const pools: Record<AppEnvironment, { max: number; min: number }> = {
  development: { max: 50, min: 5 },
  production: { max: 50, min: 3 },
  test: { max: 2, min: 0 },
};

const resolveRuntimePath = (...segments: string[]): string => {
  const candidates = [
    path.resolve(__dirname, ...segments),
    path.resolve(__dirname, '..', ...segments),
  ];

  const resolved = candidates.find((candidate) => fs.existsSync(candidate));
  if (!resolved) {
    throw new Error(`Unable to resolve runtime path for ${segments.join('/')}`);
  }

  return resolved;
};

// ── Sequelize instance ────────────────────────────────────────────────────────
const sequelizeOptions: SequelizeOptions = {
  dialect: 'postgres',
  dialectModule: require('pg'),
  dialectOptions,
  pool: pools[env],
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  logging: isProduction
    ? false
    : (sql: string, timing?: number) => {
        if (timing && timing > 1000) {
          console.warn(`Slow query (${timing}ms):`, sql);
        }
      },
  retry: {
    max: 5,
    match: [
      /ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ENOTFOUND/,
      /SequelizeConnectionError/, /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/, /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/,
    ],
  },
  models: [
    User, Role, Permission, RolePermission,
    Estate, Resident, Street, Unit, Gate,
    Address,
    Payment, Plan, Referrer, ReferralBonus, Subscription, SubscriptionEvent,
    CommunityMessage, MessageReaction, Notification, EmergencyAlert, EmergencyContact,
    EmergencyContactCategory, Country, State, City, LocationEmergencyContact,
    NFCCard, NFCAccessLog,
    Amenity, Reservation,
    ParkingSlot, ParkingAssignment, GuestParking, EVChargingSession,
    CommunityPost, CommunityComment, Faq,
    SupportTicket, SupportMessage,
    BillTransaction,
    Wallet, WalletTransaction,
    EstateWallet, EstateWalletTransaction,
    SmartMeter, ElectricityTransactionRecord,
    EstateFee, EstateInvoice, EstateWithdrawal,
    FileUpload,
  ],
};
const sequelize = hasDatabaseUrl
  ? new Sequelize(databaseUrl as string, sequelizeOptions)
  : new Sequelize({
      ...sequelizeOptions,
      host: dbHost,
      port: dbPort,
      database: dbName,
      username: dbUser,
      password: dbPassword,
    });

attachSequelizeObservability(sequelize);

// ── Programmatic migration runner (same connection as the app) ────────────────
export const runMigrations = async (): Promise<void> => {
  const umzug = new Umzug({
    migrations: {
      glob: path.join(resolveRuntimePath('../../../migrations'), '*.js'),
      resolve: ({ name, path: migPath, context: { queryInterface, Sequelize: DataTypes } }) => {
        const migration = require(migPath!);
        return {
          name,
          up: () => migration.up(queryInterface, DataTypes),
          down: () => migration.down(queryInterface, DataTypes),
        };
      },
    },
    context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
    storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeMeta', columnName: 'name' }),
    logger: console,
  });

  const pending = await umzug.pending();
  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }
  console.log(`Running ${pending.length} migration(s)…`);
  await umzug.up();
  console.log('Migrations complete.');
};

export default sequelize;
export { databaseTarget };
