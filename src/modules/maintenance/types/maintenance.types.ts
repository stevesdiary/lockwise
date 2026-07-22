export type MaintenanceCategory = 'plumbing' | 'electrical' | 'structural' | 'common_area' | 'security' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority?: MaintenancePriority;
  photo_urls?: string[];
  unit_id?: string;
}

export interface MaintenanceListQuery {
  status?: MaintenanceStatus;
}
