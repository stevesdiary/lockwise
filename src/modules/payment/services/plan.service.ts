import { PlanRepository } from '../repositories/plan.repository';
import { Plan } from '../../payment/models/plan.model';
import { ApiResponse } from '../../../shared/types/api.types';

export class PlanService {
  private planRepository: PlanRepository;

  constructor() {
    this.planRepository = new PlanRepository();
  }

  async getAllPlans(): Promise<ApiResponse<Plan[]>> {
    const plans = await this.planRepository.findAll();
    return {
      success: true,
      message: 'Plans retrieved successfully',
      data: plans
    };
  }

  async getPlanById(id: string): Promise<ApiResponse<Plan | null>> {
    const plan = await this.planRepository.findById(id);
    return {
      success: !!plan,
      message: plan ? 'Plan found' : 'Plan not found',
      data: plan
    };
  }

  async createPlan(data: Partial<Plan>): Promise<ApiResponse<Plan>> {
    const plan = await this.planRepository.create(data);
    return {
      success: true,
      message: 'Plan created successfully',
      data: plan
    };
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<ApiResponse<Plan | null>> {
    const updated = await this.planRepository.update(id, data);
    return {
      success: !!updated,
      message: updated ? 'Plan updated' : 'Plan not found',
      data: updated
    };
  }

  async deletePlan(id: string): Promise<ApiResponse<null>> {
    const success = await this.planRepository.delete(id);
    return {
      success,
      message: success ? 'Plan deleted' : 'Plan not found',
      data: null
    };
  }
}
