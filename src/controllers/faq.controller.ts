import { Request, Response } from 'express';
import { handleControllerError } from '../middlewares/error.handler';
import faqService from '../services/faq.service';

class FaqController {
  async getFaqs(req: Request, res: Response) {
    try {
      const { category, search } = req.query;

      let faqs;
      if (search) {
        faqs = await faqService.searchFaqs(search as string);
      } else if (category) {
        faqs = await faqService.getAllFaqs(category as string);
      } else {
        faqs = await faqService.getFaqsByCategory();
      }

      return res.status(200).json({
        status: 'success',
        data: faqs
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createFaq(req: Request, res: Response) {
    try {
      const { question, answer, category, order_index } = req.body;
      const created_by = req.user?.id;

      if (!created_by) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const faq = await faqService.createFaq({
        question,
        answer,
        category,
        created_by,
        order_index
      });

      return res.status(201).json({
        status: 'success',
        data: faq
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updateFaq(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { question, answer, category, is_active, order_index } = req.body;

      const updated = await faqService.updateFaq(id, {
        question,
        answer,
        category,
        is_active,
        order_index
      });

      if (!updated) {
        return res.status(404).json({
          status: 'fail',
          message: 'FAQ not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'FAQ updated successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async deleteFaq(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await faqService.deleteFaq(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          message: 'FAQ not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getAdminFaqs(req: Request, res: Response) {
    try {
      const faqs = await faqService.getAdminFaqs();

      return res.status(200).json({
        status: 'success',
        data: faqs
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new FaqController();