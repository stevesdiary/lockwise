import { Faq } from '../models/faq.model';
import { User } from '../../auth';
import { Op } from 'sequelize';

class FaqService {
  async getAllFaqs(category?: string) {
    const whereClause: any = { is_active: true };
    if (category) whereClause.category = category;

    return await Faq.findAll({
      where: whereClause,
      order: [['order_index', 'ASC'], ['created_at', 'ASC']],
      attributes: ['id', 'question', 'answer', 'category']
    });
  }

  async getFaqsByCategory() {
    const faqs = await Faq.findAll({
      where: { is_active: true },
      order: [['category', 'ASC'], ['order_index', 'ASC']],
      attributes: ['id', 'question', 'answer', 'category']
    });

    return faqs.reduce((acc: any, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      });
      return acc;
    }, {});
  }

  async createFaq(data: { question: string; answer: string; category: string; created_by: string; order_index?: number }) {
    return await Faq.create(data);
  }

  async updateFaq(id: string, data: Partial<{ question: string; answer: string; category: string; is_active: boolean; order_index: number }>) {
    const [updatedCount] = await Faq.update(data, { where: { id } });
    return updatedCount > 0;
  }

  async deleteFaq(id: string) {
    const deletedCount = await Faq.destroy({ where: { id } });
    return deletedCount > 0;
  }

  async searchFaqs(query: string) {
    return await Faq.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { question: { [Op.iLike]: `%${query}%` } },
          { answer: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['order_index', 'ASC']],
      attributes: ['id', 'question', 'answer', 'category']
    });
  }

  async getAdminFaqs() {
    return await Faq.findAll({
      include: [{ model: User, as: 'creator', attributes: ['first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });
  }
}

export default new FaqService();