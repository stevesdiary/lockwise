import { Optional } from "sequelize";
// import { AccessLog } from "../modules/accessLog";

export interface LogAttributes {
  log_id: string;
  estate_id: string;
  visitor_name: string;
  schedule_in: Date;
  schedule_out: Date;
  access_type: "guest" | "resident" | "staff" | "delivery" | "maintenance" | "security" | "others";
  resident_id: string;
  entry_time: Date;
  verification_method: "RFID" | "QR code" | "access code" | "manual approval";
  exit_time: Date;
  status: "approved" | "pending" | "denied";
  remarks?: string;
  vehicle_number?: string;
  timestamp: Date;
  created_at?: Date;
  updated_at?: Date;
  estate_name?: string;
  user?: string;
}

export type LogCreationAttributes = Optional<LogAttributes, "log_id" | "created_at" | "updated_at">;

export type LogUpdateAttributes = Partial<Omit<LogAttributes, "log_id" | "created_at" | "updated_at">>;


export type LogResponse = Omit<LogAttributes, "created_at" | "updated_at"> & {
  resident?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  estate?: {
    id: string;
    name: string;
  };
};
