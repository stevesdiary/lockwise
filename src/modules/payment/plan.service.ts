import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from './plan.model';
import { ApiResponse } from '../../types/api.type';

export class PlanService {
  private planRepository: PlanRepository;

  constructor() {
    this.planRepository = new PlanRepository();
  }

  async getAllPlans(): Promise<ApiResponse<Plan[]>> {
    const plans = await this.planRepository.findAll();
    return {
      status: 'success',
      statusCode: 200,
      message: 'Plans retrieved successfully',
      data: plans
    };
  }

  async getPlanById(id: string): Promise<ApiResponse<Plan | null>> {
    const plan = await this.planRepository.findById(id);
    return {
      status: plan ? 'success' : 'fail',
      statusCode: plan ? 200 : 404,
      message: plan ? 'Plan found' : 'Plan not found',
      data: plan
    };
  }

  async createPlan(data: Partial<Plan>): Promise<ApiResponse<Plan>> {
    const plan = await this.planRepository.create(data);
    return {
      status: 'success',
      statusCode: 201,
      message: 'Plan created successfully',
      data: plan
    };
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<ApiResponse<Plan | null>> {
    const updated = await this.planRepository.update(id, data);
    return {
      status: updated ? 'success' : 'fail',
      statusCode: updated ? 200 : 404,
      message: updated ? 'Plan updated' : 'Plan not found',
      data: updated
    };
  }

  async deletePlan(id: string): Promise<ApiResponse<null>> {
    const success = await this.planRepository.delete(id);
    return {
      status: success ? 'success' : 'fail',
      statusCode: success ? 200 : 404,
      message: success ? 'Plan deleted' : 'Plan not found',
      data: null
    };
  }
}
