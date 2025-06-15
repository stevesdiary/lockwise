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
  verified_by: string;
}

export type AccessCreationAttributes = Omit<AccessAttributes, 'log_id'>;
// const payload: AccessCreationAttributes = {
//   visitor_name: 'Visitor from app', // default or mapped from user input
//   schedule_in: new Date(userInput.set_date_in + 'T' + userInput.set_time_in),
//   schedule_out: new Date(userInput.set_date_out + 'T' + userInput.set_time_out),
//   entry_time: undefined, // or set default
//   access_type: 'guest',
//   verification_method: userInput.verification_method || 'access_code',
//   vehicle_number: userInput.vehicle_number,
//   status: 'pending',
//   remarks: userInput.remarks || '',
//   exit_time: undefined,
//   estate_id: req.user?.estate_id ?? 'fallback-id',
//   resident_id: req.user?.resident_id ?? 'fallback-id',
//   verified_by: req.user?.user_id ?? 'system',
// };
