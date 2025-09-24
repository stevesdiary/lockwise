export type AccessStatus = 'approved' | 'pending' | 'denied' | 'cancelled' | 'expired';
export type AccessType = 'guest' | 'resident' | 'staff' | 'delivery' | 'maintenance' | 'security' | 'others';
export type VerificationMethod = 'RFID' | 'QR_code' | 'access_code' | 'manual_approval';

// Main access record - represents a visitor's permission to access
export interface AccessAttributes {
  id: string;
  user_id: string;
  access_code: string;
  date_in: Date;
  date_out: Date;
  entry_time?: string;
  exit_time?: string;
  estate_id: string;
  access_type: AccessType;
  verification_method: VerificationMethod;
  vehicle_number?: string;
  status: AccessStatus;
  remarks?: string;
  resident_id: string;
  created_by: string;
  is_multi_entry?: boolean;
  max_entries?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type AccessCreationAttributes = Omit<AccessAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Individual entry/exit records for multiple entries
export interface AccessEntryAttributes {
  id: string;
  access_id: string;
  entry_time: Date;
  exit_time?: Date;
  scanned_by?: string;
  gate_id?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type AccessEntryCreationAttributes = Omit<AccessEntryAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Response types for API
export interface AccessWithEntriesResponse extends AccessAttributes {
  entries?: AccessEntryAttributes[];
  total_entries?: number;
  remaining_entries?: number;
}

// Multiple entry configuration
export interface MultipleEntryConfig {
  is_multi_entry: boolean;
  max_entries?: number;
  current_entries?: number;
}

// Entry/Exit operation types
export interface EntryOperation {
  access_id: string;
  scanned_by?: string;
  gate_id?: string;
  remarks?: string;
}

export interface ExitOperation {
  entry_id: string;
  scanned_by?: string;
  gate_id?: string;
  remarks?: string;
}
