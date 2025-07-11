import { Router, Request as ExpressRequest, Response } from 'express';

import { userController } from './user.controller';
// import { TypedRequest } from '../types/type';

const userRouter = Router();

userRouter.post("/register", async (req: ExpressRequest, res: Response) => {
  await userController.register(req, res);
});

userRouter.post("/verify",
  async (req: ExpressRequest, res: Response) => {
  await userController.verifyUser(req, res);
});

// userRouter.post("/resendcode",
//   async (req: ExpressRequest, res: Response) => {
//   await userController.resendCode(req, res);
// });

userRouter.get('/all',
  // authentication,
  // checkRole(['admin']), 
  async (req: ExpressRequest, res: Response) => {
  await userController.getUsersByEstate(req, res)
});

userRouter.get('/one/:id', 
  // authentication,
  // checkRole(['admin']), 
  async (req: ExpressRequest, res: Response) => {
  await userController.getOneUser(req, res);
});

userRouter.delete('/delete/:id',
  
  async (req: ExpressRequest, res: Response) => {
  await userController.deleteUser(req, res);
})

export default userRouter;
