// Shared middleware barrel — single import surface for all cross-cutting middleware
export { authenticateToken, requireRole, requireAdmin, requireSecurity, requireManager, requireResident, AuthRequest } from './auth.middleware';
export { requirePermission, requireAnyPermission, requireAllPermissions, authorizeRoles } from './permission.middleware';
export { analyticsMiddleware } from './analytics.middleware';
export { auditLogger } from './audit.middleware';
export { rateLimiters } from './rate-limit.middleware';
export { validateApiKey, ApiKeyRequest } from './api-key.middleware';
export { generateCsrfToken, verifyCsrfToken } from './csrf.middleware';
export { AppError, errorHandler, notFoundHandler, asyncHandler, validationError } from './error-handler.middleware';
export { requireEstateScope, requireResourceInEstate, requireResourceOwnership, requireEstateAndOwnership, scopeQueryToEstate } from './estate-scope.middleware';
export { sanitizeFilename, verifyFileType, uploadMiddleware, verifyUploadedFile, cleanupOnError } from './file-upload-security.middleware';
export { default as monitoringService } from './monitoring';
export { securityHeaders, authRateLimiter, sensitiveOperationLimiter, apiRateLimiter, webhookRateLimiter } from './security.middleware';
export { verifyUser } from './verify-user.middleware';
