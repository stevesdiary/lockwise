import crypto from 'crypto';
import { User } from '../models/user.model';

const getOtplib = async () => {
  const otplib = await import('otplib');
  return otplib;
};

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-key-change-me';
const APP_NAME = process.env.APP_NAME || 'Lockwise';
const TWO_FA_ROLES = ['admin', 'support', 'super_admin', 'manager'];

function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, 'lockwise-2fa-salt', 32);
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(data: string): string {
  const [ivHex, tagHex, encryptedHex] = data.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(ENCRYPTION_KEY), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(encryptedHex, 'hex')) + decipher.final('utf8');
}

function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return codes.map(code => crypto.createHash('sha256').update(code).digest('hex'));
}

class TwoFactorService {

  isEligibleRole(role: string): boolean {
    return TWO_FA_ROLES.includes(role?.toLowerCase());
  }

  async generateSetup(userId: string): Promise<{ secret: string; qrCodeUri: string; backupCodes: string[] }> {
    const otplib = await getOtplib();
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (user.two_factor_enabled) {
      throw new Error('2FA is already enabled');
    }

    const secret = otplib.generateSecret();
    const otpauthUrl = otplib.generateURI({
      issuer: APP_NAME,
      label: user.email,
      secret,
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });

    // Store encrypted secret (not yet enabled — awaiting verification)
    await user.update({ two_factor_secret: encrypt(secret) });

    const backupCodes = generateBackupCodes();

    return { secret, qrCodeUri: otpauthUrl, backupCodes };
  }

  async verifyAndEnable(userId: string, token: string, backupCodes: string[]): Promise<boolean> {
    const otplib = await getOtplib();
    const user = await User.findByPk(userId);
    if (!user || !user.two_factor_secret) throw new Error('2FA setup not initiated');

    const secret = decrypt(user.two_factor_secret);
    const result = otplib.verifySync({ token, secret, algorithm: 'sha1', digits: 6, period: 30 });

    if (!result.valid) return false;

    const hashedCodes = await hashBackupCodes(backupCodes);
    await user.update({
      two_factor_enabled: true,
      two_factor_backup_codes: encrypt(JSON.stringify(hashedCodes)),
    });

    return true;
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const otplib = await getOtplib();
    const user = await User.findByPk(userId);
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) return false;

    const secret = decrypt(user.two_factor_secret);
    // window: 1 allows ±30s drift
    const result = otplib.verifySync({ token, secret, algorithm: 'sha1', digits: 6, period: 30 });
    return result.valid;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user || !user.two_factor_enabled || !user.two_factor_backup_codes) return false;

    const hashedCodes: string[] = JSON.parse(decrypt(user.two_factor_backup_codes));
    const codeHash = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');

    const codeIndex = hashedCodes.indexOf(codeHash);
    if (codeIndex === -1) return false;

    // Remove used code
    hashedCodes.splice(codeIndex, 1);
    await user.update({
      two_factor_backup_codes: encrypt(JSON.stringify(hashedCodes)),
    });

    return true;
  }

  async disable(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    await user.update({
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null,
    });
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const user = await User.findByPk(userId);
    if (!user || !user.two_factor_enabled) throw new Error('2FA not enabled');

    const backupCodes = generateBackupCodes();
    const hashedCodes = await hashBackupCodes(backupCodes);
    await user.update({
      two_factor_backup_codes: encrypt(JSON.stringify(hashedCodes)),
    });

    return backupCodes;
  }
}

export default new TwoFactorService();
