import { Router } from 'express';
import communityRouter from './routes/community.route';
import communityBoardRouter from './routes/community.board.route';
import faqRouter from './routes/faq.route';

const communitySubRouter = Router();

// Community messaging routes (moved from communication/ in Task 14)
communitySubRouter.use('/', communityRouter);
// Community board posts
communitySubRouter.use('/', communityBoardRouter);
// FAQs at /community/faqs
communitySubRouter.use('/faqs', faqRouter);

export default communitySubRouter;
