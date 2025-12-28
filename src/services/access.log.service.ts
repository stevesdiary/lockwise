import { AccessLog } from "../models/access.log.model";
import { User } from "../models/user.model";
import { Estate } from "../models/estate.model";
import { Op } from "sequelize";
import { saveToRedis, getFromRedis, deleteFromRedis } from "../core/redis";

// Utility function to generate random 6-digit codes
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate TTL in seconds for access code (entry window end + 90 seconds)
function calculateAccessCodeTTL(entryEndTime?: Date): number {
  if (!entryEndTime) {
    return 86400; // Default 24 hours if no entry end time specified
  }

  const now = new Date();
  const expiryTime = new Date(entryEndTime.getTime() + 90 * 1000); // +90 seconds
  const ttlSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);

  return Math.max(ttlSeconds, 60); // Minimum 1 minute TTL
}

// Calculate TTL in seconds for exit code (exit window end + 90 seconds)
function calculateExitCodeTTL(exitEndTime?: Date): number {
  if (!exitEndTime) {
    return 86400; // Default 24 hours if no exit end time specified
  }

  const now = new Date();
  const expiryTime = new Date(exitEndTime.getTime() + 90 * 1000); // +90 seconds
  const ttlSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);

  return Math.max(ttlSeconds, 60); // Minimum 1 minute TTL
}

class AccessLogService {
  async createAccessRequest(data: {
    user_id: string;
    estate_id: string;
    // Entry window
    scheduled_entry_date?: Date;
    scheduled_entry_end?: Date;
    // Exit window
    scheduled_exit_date?: Date;
    scheduled_exit_end?: Date;
    vehicle_number?: string;
    remarks?: string;
    created_by?: string;
  }) {
    return await AccessLog.create({
      ...data,
      status: "pending",
      is_multi_entry: false,
    });
  }

  async approveAccess(accessId: string, approvedBy: string) {
    const accessCode = generateAccessCode();
    const exitCode = generateAccessCode();

    // Get the access log to check scheduled times
    const accessLog = await AccessLog.findByPk(accessId);
    if (!accessLog) {
      throw new Error("Access log not found");
    }

    // Calculate separate TTLs for access and exit codes
    const accessCodeTTL = calculateAccessCodeTTL(
      accessLog.scheduled_entry_end || accessLog.scheduled_entry_date
    );
    const exitCodeTTL = calculateExitCodeTTL(
      accessLog.scheduled_exit_end || accessLog.scheduled_exit_date
    );

    // Store codes in Redis with their respective TTLs
    await saveToRedis(`access_code:${accessCode}`, accessId, accessCodeTTL);
    await saveToRedis(`exit_code:${exitCode}`, accessId, exitCodeTTL);

    return await AccessLog.update(
      {
        status: "approved",
        approved_by: approvedBy,
        approved_at: new Date(),
        access_code: accessCode,
        exit_code: exitCode,
      },
      { where: { id: accessId } }
    );
  }

  async logEntry(accessId: string, gateId?: string, scannedBy?: string) {
    return await AccessLog.update(
      {
        actual_entry_time: new Date(),
        gate_id: gateId,
        scanned_by: scannedBy,
      },
      { where: { id: accessId } }
    );
  }

  async logExit(accessId: string) {
    return await AccessLog.update(
      { actual_exit_time: new Date() },
      { where: { id: accessId } }
    );
  }

  async getAccessLogs(filters: {
    user_id?: string;
    estate_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return await AccessLog.findAll({
      where: {
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.estate_id && { estate_id: filters.estate_id }),
        ...(filters.status && { status: filters.status }),
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "email"],
        },
        { model: Estate, attributes: ["name"] },
        {
          model: User,
          as: "approver",
          attributes: ["first_name", "last_name"],
        },
      ],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [["created_at", "DESC"]],
    });
  }

  async getActiveAccess(userId: string, estateId: string) {
    return await AccessLog.findOne({
      where: {
        user_id: userId,
        estate_id: estateId,
        status: "approved",
        actual_entry_time: { [Op.ne]: null } as any,
        actual_exit_time: { [Op.is]: null } as any,
      },
    });
  }

  async processCodeScan(code: string, gateId?: string, scannedBy?: string) {
    // Check Redis first for code validity
    const accessIdFromRedis =
      (await getFromRedis(`access_code:${code}`)) ||
      (await getFromRedis(`exit_code:${code}`));

    if (!accessIdFromRedis) {
      throw new Error("Code expired or invalid");
    }

    // Get access log from database
    const accessLog = await AccessLog.findByPk(accessIdFromRedis);
    if (!accessLog || accessLog.status !== "approved") {
      throw new Error("Access not found or not approved");
    }

    // Check if this is an access_code (for entry)
    const isAccessCode = await getFromRedis(`access_code:${code}`);
    if (isAccessCode && !accessLog.actual_entry_time) {
      // Entry: User hasn't entered yet
      await this.logEntry(accessLog.id, gateId, scannedBy);
      return { action: "entry", accessLog };
    }

    // Check if this is an exit_code (for exit)
    const isExitCode = await getFromRedis(`exit_code:${code}`);
    if (
      isExitCode &&
      accessLog.actual_entry_time &&
      !accessLog.actual_exit_time
    ) {
      // Exit: User is exiting with exit code
      await this.logExit(accessLog.id);
      // Clean up Redis codes after successful exit
      await deleteFromRedis(`access_code:${accessLog.access_code}`);
      await deleteFromRedis(`exit_code:${accessLog.exit_code}`);
      return { action: "exit", accessLog };
    }

    // Fallback: Use access_code for exit if user is inside
    if (
      isAccessCode &&
      accessLog.actual_entry_time &&
      !accessLog.actual_exit_time
    ) {
      // Exit: User is exiting with same access code
      await this.logExit(accessLog.id);
      // Clean up Redis codes after successful exit
      await deleteFromRedis(`access_code:${accessLog.access_code}`);
      await deleteFromRedis(`exit_code:${accessLog.exit_code}`);
      return { action: "exit", accessLog };
    }

    throw new Error("Invalid code usage or user state");
  }

  async generateResidentExitCode(accessId: string, residentId: string) {
    const accessLog = await AccessLog.findOne({
      where: {
        id: accessId,
        user_id: residentId,
        status: "approved",
        actual_entry_time: { [Op.ne]: null } as any,
        actual_exit_time: { [Op.is]: null } as any,
      },
    });

    if (!accessLog) {
      throw new Error("No active access found for resident");
    }

    // Calculate remaining TTL based on exit window end time + 90 seconds
    const ttl = calculateExitCodeTTL(
      accessLog.scheduled_exit_end || accessLog.scheduled_exit_date
    );

    const newExitCode = generateAccessCode();

    // Remove old exit code from Redis
    if (accessLog.exit_code) {
      await deleteFromRedis(`exit_code:${accessLog.exit_code}`);
    }

    // Store new exit code in Redis with calculated TTL
    await saveToRedis(`exit_code:${newExitCode}`, accessId, ttl);

    // Update database
    await AccessLog.update(
      { exit_code: newExitCode },
      { where: { id: accessId } }
    );

    return {
      exit_code: newExitCode,
      expires_at: new Date(Date.now() + ttl * 1000),
    };
  }
}

export default new AccessLogService();
