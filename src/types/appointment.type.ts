// import { AppointmentStatus } from "../appointment/appointment.model";

export enum AppointmentStatus {
  scheduled = 'scheduled',
  completed = 'completed',
  cancelled = 'cancelled',
  pending = 'pending',
  no_show = 'no_show',
  in_progress = 'in_progress',
  rescheduled = 'rescheduled',
  waiting_list = 'waiting_list',
}

type Identifier = string;
export interface AppointmentCreateDTO {
  [x: string]: Identifier | undefined;
  user_id: string;
  doctor_id: string;
  hospital_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
  status?: AppointmentStatus;
}



export interface AppointmentResponse {
  id: string;
  user_id: string;
  hospital_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
}

export interface ApiResponse<T> {
  statusCode: number;
  status: 'success' | 'error' | 'fail';
  message: string;
  data: T | null;
}

export interface AppointmentService {
  createAppointment(appointmentData: AppointmentCreateDTO): Promise<ApiResponse<AppointmentResponse>>;
  
  getAppointment(id: string): Promise<ApiResponse<AppointmentResponse>>;
  
  getAppointments(filters: {
    patient_id?: string;
    doctor_id?: string;
    date?: string;
    status?: AppointmentStatus;
  }): Promise<ApiResponse<AppointmentResponse[]>>;
  
  updateAppointmentStatus(
    id: string, 
    status: AppointmentStatus
  ): Promise<ApiResponse<AppointmentResponse>>;
  
  cancelAppointment(id: string): Promise<ApiResponse<AppointmentResponse>>;
  
  checkConflicts(
    doctor_id: string,
    date: string,
    start_time: string,
    end_time: string
  ): Promise<ApiResponse<boolean>>;
}

export interface AppointmentUpdateResponse {
  statusCode: number;
  status: 'success' | 'error';
  message: string;
  data: string[] | null;
}

export interface AppointmentUpdateRequest {
  status: AppointmentStatus;
}