import { Router, Request as ExpressRequest, Response } from 'express';
import roleController from '../controllers/role.controller';

const roleRouter = Router();

roleRouter.get('/', async (req: ExpressRequest, res: Response) => {
  await roleController.getAllRoles(req, res);
})

roleRouter.post('/create', async (req: ExpressRequest, res: Response) => {
  await roleController.create(req, res);
});

roleRouter.get('/:roleId', async (req: ExpressRequest, res: Response) => {
  await roleController.getRoleById(req, res);
});

roleRouter.put('/update/:roleId', async (req: ExpressRequest, res: Response) => {
  await roleController.updateRole(req, res);
});

roleRouter.delete('/delete/:roleId', async (req: ExpressRequest, res: Response) => {
  await roleController.deleteRole(req, res);
});

export default roleRouter;