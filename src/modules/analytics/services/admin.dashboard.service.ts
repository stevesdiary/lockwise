import { Payment } from "../../payment/models/payment.model";
import { User } from "../../auth/models/user.model";
import { Estate } from "../../estate/models/estate.model";
import accessLogService from "../../access/services/access-log.service";
import { analyticsService } from "./analytics.service";

export const adminDashboardService = {
  getOverview: async () => {
    return await analyticsService.getUsageStats(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    );
  },

  getAnalytics: async (period: "week" | "month" | "year" = "month") => {
    const days = period === "week" ? 7 : period === "month" ? 30 : 365;
    return await analyticsService.getUsageStats(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    );
  },

  getAllPayments: async (filters: {
    limit?: number;
    offset?: number;
    status?: string;
  }) => {
    return await Payment.findAll({
      where: {
        ...(filters.status && { payment_status: filters.status }),
      },
      include: [
        { model: User, attributes: ["first_name", "last_name", "email"] },
        { model: Estate, attributes: ["name"] },
      ],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [["createdAt", "DESC"]],
    });
  },

  getAllUsers: async (filters: { limit?: number; offset?: number }) => {
    return await User.findAll({
      include: [{ model: Estate, attributes: ["name"] }],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [["createdAt", "DESC"]],
    });
  },

  getAccessLogs: async (filters: {
    limit?: number;
    offset?: number;
    estate_id?: string;
  }) => {
    return await accessLogService.getAccessLogs({
      estate_id: filters.estate_id,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });
  },
};
