import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { UserRole } from '../../auth/types/user.types';

export const validateChatAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { chatId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  // Admin and Manager can access all chats
  if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER || userRole === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Users can only access their own chats
  if (chatId && !chatId.includes(userId)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied to this chat'
    });
  }

  next();
};

export const validateFileUpload = (req: AuthRequest, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return next();
  }

  // Check file count limit
  if (files.length > 3) {
    return res.status(400).json({
      status: 'error',
      message: 'Maximum 3 files allowed per message'
    });
  }

  // Check total size limit (15MB total)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 15 * 1024 * 1024) {
    return res.status(400).json({
      status: 'error',
      message: 'Total file size cannot exceed 15MB'
    });
  }

  next();
};