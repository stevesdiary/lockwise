import { Plan } from '../models/plan.model';

export class PlanRepository {
  async findAll(): Promise<Plan[]> {
    return await Plan.findAll();
  }

  async findById(id: string): Promise<Plan | null> {
    return await Plan.findByPk(id);
  }

  async create(data: Partial<Plan>): Promise<Plan> {
    return await Plan.create(data);
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan | null> {
    const plan = await Plan.findByPk(id);
    if (!plan) return null;

    return await plan.update(data);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Plan.destroy({ where: { id } });
    return deleted > 0;
  }
}
