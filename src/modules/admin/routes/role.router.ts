import { Router, Request as ExpressRequest, Response } from "express";
import roleController from "../controllers/role.controller";
import { authenticateToken, requireAdmin } from "../../auth/middleware/auth.middleware";
import { verifyCsrfToken } from "../../../shared/middleware/csrf.middleware";

const roleRouter = Router();

roleRouter.get("/all", authenticateToken, async (req: ExpressRequest, res: Response) => {
  await roleController.getAllRoles(req, res);
});

roleRouter.post("/create", authenticateToken, requireAdmin, verifyCsrfToken, async (req: ExpressRequest, res: Response) => {
  await roleController.create(req, res);
});

roleRouter.get("/:roleId", authenticateToken, async (req: ExpressRequest, res: Response) => {
  await roleController.getRoleById(req, res);
});

roleRouter.put(
  "/update/:roleId",
  authenticateToken,
  requireAdmin,
  verifyCsrfToken,
  async (req: ExpressRequest, res: Response) => {
    await roleController.updateRole(req, res);
  }
);

roleRouter.delete(
  "/delete/:roleId",
  authenticateToken,
  requireAdmin,
  verifyCsrfToken,
  async (req: ExpressRequest, res: Response) => {
    await roleController.deleteRole(req, res);
  }
);

roleRouter.post(
  "/assign-permissions/:roleId",
  authenticateToken,
  requireAdmin,
  verifyCsrfToken,
  async (req: ExpressRequest, res: Response) => {
    await roleController.assignPermissions(req, res);
  }
);

export default roleRouter;
