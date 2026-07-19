import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller";
import { serveFile } from "../controllers/file.controller";
import { authenticateToken } from "../../../shared/middleware/auth.middleware";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  uploadController.uploadFile
);
router.get("/files", authenticateToken, uploadController.getFiles);
router.get("/file/:folder/:filename", serveFile);

export default router;
