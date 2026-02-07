import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller";
import { authenticateToken } from "../../auth/middleware/auth.middleware";

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
router.post("/test-upload", upload.single("file"), uploadController.uploadFile); // Test endpoint without auth
router.get("/files", authenticateToken, uploadController.getFiles);
router.get("/test-files", uploadController.getFiles); // Test endpoint without auth

export default router;
