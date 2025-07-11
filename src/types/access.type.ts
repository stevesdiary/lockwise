export type AccessStatus = 'approved' | 'pending' | 'denied';

export interface AccessAttributes {
  log_id: string;
  visitor_name: string;
  schedule_in: Date;
  schedule_out: Date;
  entry_time?: Date;
  access_type: string;
  verification_method: string;
  vehicle_number?: string;
  status: AccessStatus;
  remarks?: string;
  exit_time?: Date;
  estate_id: string;
  resident_id: string;
  approved_by: string;
}

export type AccessCreationAttributes = Omit<AccessAttributes, 'log_id'>;

export interface AccessAttributes {
  id: string;
  visitor_name: string;
  schedule_in: Date;
  schedule_out: Date;
  verified_by: string;
  estate_id: string;
  resident_id: string;
  status: AccessStatus;
  entry_time?: Date;
  exit_time?: Date;
  remarks?: string;
}

// export type AccessCreationAttributes = Omit<AccessAttributes, 'id'>;
