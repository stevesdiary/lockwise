import { Request as ExpressRequest, response } from 'express';
import { Router, Response, Request as ExpressReque} from 'express';

const permissionRouter = Router();
import {PermissionController} from '../controllers/permission.controller';

const permissionController = new PermissionController();

permissionRouter.post('/create', permissionController.createPermission);
permissionRouter.get('/all', permissionController.getAllPermissions);
permissionRouter.get('/:id', permissionController.getPermissionById);
permissionRouter.put('/:id', permissionController.updatePermission);
permissionRouter.delete('/:id', permissionController.deletePermission);

export default permissionRouter;