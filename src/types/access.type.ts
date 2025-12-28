// Access log status types
export type AccessLogStatus = 'pending' | 'approved' | 'rejected' | 'expired';

// Access request creation interface
export interface AccessRequestData {
  user_id: string;
  estate_id: string;
  scheduled_entry_date?: Date;
  scheduled_exit_date?: Date;
  vehicle_number?: string;
  remarks?: string;
  created_by?: string;
}

// Entry logging interface
export interface EntryLogData {
  access_id: string;
  gate_id?: string;
  scanned_by?: string;
}

// Access log filters for queries
export interface AccessLogFilters {
  user_id?: string;
  estate_id?: string;
  status?: AccessLogStatus;
  limit?: number;
  offset?: number;
}
