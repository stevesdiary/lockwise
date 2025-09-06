import { AccessRepository } from '../repositories/access.repository';
import { 
  AccessCreationAttributes, 
  EntryOperation, 
  ExitOperation,
  AccessWithEntriesResponse,
  AccessEntryAttributes
} from '../types/access.type';

// Define a basic ApiResponse type if it doesn't exist
interface ApiResponse<T> {
  statusCode: number;
  status: string;
  message: string;
  data: T | null;
}

class AccessService {
  private accessRepository: AccessRepository;

  constructor() {
    this.accessRepository = new AccessRepository();
  }

  async createAccess(accessData: AccessCreationAttributes): Promise<ApiResponse<any>> {
    try {
      const access = await this.accessRepository.createAccessLog(accessData);
      return {
        statusCode: 201,
        status: 'success',
        message: 'Access record created successfully',
        data: access
      };
    } catch (error) {
      console.error('Create access error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to create access record',
        data: null
      };
    }
  }

  async recordEntry(entryData: EntryOperation): Promise<ApiResponse<any>> {
    try {
      const entry = await this.accessRepository.createEntry(entryData);
      return {
        statusCode: 201,
        status: 'success',
        message: 'Entry recorded successfully',
        data: entry
      };
    } catch (error) {
      console.error('Record entry error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to record entry',
        data: null
      };
    }
  }

  async recordExit(exitData: ExitOperation): Promise<ApiResponse<any>> {
    try {
      const exit = await this.accessRepository.createExit(exitData);
      if (!exit) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Entry not found',
          data: null
        };
      }
      return {
        statusCode: 200,
        status: 'success',
        message: 'Exit recorded successfully',
        data: exit
      };
    } catch (error) {
      console.error('Record exit error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to record exit',
        data: null
      };
    }
  }

  async getAccessWithEntries(accessId: string): Promise<ApiResponse<AccessWithEntriesResponse>> {
    try {
      const accessWithEntries = await this.accessRepository.getAccessWithEntries(accessId);
      if (!accessWithEntries) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Access record not found',
          data: null
        };
      }
      return {
        statusCode: 200,
        status: 'success',
        message: 'Access record retrieved successfully',
        data: accessWithEntries
      };
    } catch (error) {
      console.error('Get access with entries error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve access record',
        data: null
      };
    }
  }

  async getActiveEntries(accessId: string): Promise<ApiResponse<AccessEntryAttributes[]>> {
    try {
      const activeEntries = await this.accessRepository.getActiveEntries(accessId);
      return {
        statusCode: 200,
        status: 'success',
        message: 'Active entries retrieved successfully',
        data: activeEntries
      };
    } catch (error) {
      console.error('Get active entries error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve active entries',
        data: null
      };
    }
  }

  async canVisitorEnter(accessId: string): Promise<ApiResponse<{ canEnter: boolean; reason?: string }>> {
    try {
      const result = await this.accessRepository.canVisitorEnter(accessId);
      return {
        statusCode: 200,
        status: 'success',
        message: 'Entry permission check completed',
        data: result
      };
    } catch (error) {
      console.error('Check entry permission error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to check entry permission',
        data: null
      };
    }
  }

  async checkInVisitor(accessId: string, approverId: string, remarks?: string): Promise<ApiResponse<any>> {
    try {
      const checkInData = {
        entry_time: new Date().toISOString(),
        approved_by: approverId,
        remarks
      };
      const result = await this.accessRepository.checkIn(accessId, checkInData);
      if (!result) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Access record not found',
          data: null
        };
      }
      return {
        statusCode: 200,
        status: 'success',
        message: 'Visitor checked in successfully',
        data: result
      };
    } catch (error) {
      console.error('Check in visitor error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to check in visitor',
        data: null
      };
    }
  }

  async checkOutVisitor(accessId: string, approverId: string): Promise<ApiResponse<any>> {
    try {
      const checkOutData = {
        exit_time: new Date().toISOString(),
        approved_by: approverId
      };
      const result = await this.accessRepository.updateAccess(accessId, checkOutData);
      if (!result) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Access record not found',
          data: null
        };
      }
      return {
        statusCode: 200,
        status: 'success',
        message: 'Visitor checked out successfully',
        data: result
      };
    } catch (error) {
      console.error('Check out visitor error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to check out visitor',
        data: null
      };
    }
  }

  async getAccesss(estateId?: string): Promise<ApiResponse<any[]>> {
    try {
      // For now, just get all access logs since getAccessLogsByEstate method may not exist
      const accessLogs = await this.accessRepository.getAllAccessLogs();
      return {
        statusCode: 200,
        status: 'success',
        message: 'Access logs retrieved successfully',
        data: accessLogs
      };
    } catch (error) {
      console.error('Get access logs error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve access logs',
        data: null
      };
    }
  }

  async getOnelog(accessId: string): Promise<ApiResponse<any>> {
    try {
      const access = await this.accessRepository.getAccessLogById(accessId);
      if (!access) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Access record not found',
          data: null
        };
      }
      return {
        statusCode: 200,
        status: 'success',
        message: 'Access record retrieved successfully',
        data: access
      };
    } catch (error) {
      console.error('Get access log error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve access record',
        data: null
      };
    }
  }
}

export const accessService = new AccessService();
export default accessService;