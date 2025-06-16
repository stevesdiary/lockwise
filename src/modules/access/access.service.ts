import dayjs from 'dayjs';
import { ApiResponse } from "../../types/user.type";
import  { AccessRepository }  from "../repositories/access.repository";
import { AccessAttributes } from "../../types/access.type";
import { AccessCreationAttributes } from "../../types/access.type";

class AccessService {
  private accessRepository: AccessRepository;

  constructor() {
    this.accessRepository = new AccessRepository();
  }

  async createAccess(validatedAccessData: any): Promise<ApiResponse<AccessAttributes>> {
    
    const accessData = {
      ...validatedAccessData
    }
    const access = await this.accessRepository.createAccessLog(accessData);
    if(!access){
      throw new Error('Failed to create access')
    }
    return {
      statusCode: 201,
      status: 'success',
      message: 'Access created successfully',
      data: accessData
    };
  }

  async checkInVisitor(access_id: string, approver_id: string, remarks?: string): Promise<ApiResponse<AccessAttributes>> {
  const now = new Date();

  const updateData = {
    entry_time: now,
    status: 'approved',
    remarks,
    verified_by: approver_id,
  };

  const accessUpdate = await this.accessRepository.updateAccess(access_id, updateData);

  if (!accessUpdate) throw new Error('Check-in failed');

  return {
    statusCode: 200,
    status: 'success',
    message: 'Visitor checked in successfully',
    data: accessUpdate as any,
  };
}

  async updateAccess(access_id: string, accessData: any): Promise<ApiResponse<AccessAttributes>> {
    const moment = dayjs();
    const day = new Date();
    const date = day.toISOString().split('T')[0];
    const entryTime = moment.format('hh:mm A');
    const exitTime = moment.format('hh:mm: A');
    const updateData = {
      entry_time: entryTime,
      exit_time: exitTime,
      status: accessData.status,
      remarks: accessData.remarks,
      approved_by: accessData.approver
    }
    const accessUpdate = await this.accessRepository.updateAccess(access_id, updateData);
    if (!accessUpdate){
      throw new Error('Update not effected');
    }
    return {
      statusCode: 200,
      status: 'success',
      message: "Access updated SUccessfully",
      data: accessUpdate as any
    }
  }
  async getAccesss(estate_id: string): Promise<ApiResponse<AccessAttributes[]>> {
    const accesses =  await this.accessRepository.getAllAccessLogs();
    if(!accesses || accesses.length === 0) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'No record match this query',
        data: []     
      };
    }
    return {
      statusCode: 200,
      status: 'success',
      message: 'Access found successfully',
      data: accesses as any
    };
  }

  async getOnelog(id: string): Promise<ApiResponse<AccessAttributes | null>> {
    const access = await this.accessRepository.getAccessLogById(id);
    if (!access) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'No record match this query',
        data: null
      };
    }
    return {
      statusCode: 200,
      status: 'success',
      message: 'Access found successfully',
      data: access as any
    };
  }
}

export const accessService = new AccessService();
export default accessService;
