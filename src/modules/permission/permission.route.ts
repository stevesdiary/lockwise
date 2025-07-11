import { Request as ExpressRequest, response } from 'express';
import { Router, Response, Request as ExpressReque} from 'express';

const permissionRouter = Router();
import {PermissionController} from './permission.controller';


permissionRouter.post('/create', async (req: ExpressRequest, res: Response ) => {
  // await PermissionController.createPermission(req, res);
});

// permissionRouter.get('/all', PermissionController.getAllPermissions);
// permissionRouter.get('/:id', PermissionController.getPermissionById);
// permissionRouter.put('/:id', PermissionController.updatePermission);
// permissionRouter.delete('/:id', PermissionController.deletePermission);

export default permissionRouter;