import { Router, Request, Response } from "express";
import { authenticateJWT } from "../../middlewares/authentication";
import { ReferralController } from "./referral.controller";
// import {authentication} from '../../middlewares/authentication';
const referralRouter =  Router();

referralRouter.post("/register",
  async (req: Request, res: Response) => {
    await ReferralController.registerReferrer(req, res);
  }
  
);

referralRouter.get("/:code",
    async (req: Request, res: Response) => {
    await ReferralController.getReferrer(req, res);
  }
);

referralRouter.get("/all", 
  async (req: Request, res: Response) => {
  await ReferralController.listReferrers(req, res);
});

referralRouter.delete('/delete/:id',
  // authentication,
  async (req: Request, res: Response) => {
    await ReferralController.deleteReferrer(req, res);
  }
)

export default referralRouter;