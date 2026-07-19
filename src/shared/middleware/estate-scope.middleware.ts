import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Ensures user is associated with an estate
 */
export const requireEstateScope = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.estate_id) {
    return res.status(403).json({ 
      error: 'User not associated with an estate',
      code: 'NO_ESTATE_ASSOCIATION'
    });
  }

  next();
};

/**
 * Validates that a resource belongs to the user's estate
 * Prevents IDOR (Insecure Direct Object Reference) attacks
 * 
 * @param modelPath - Path to model file (e.g., 'estate/models/resident.model')
 * @param modelName - Name of the model class (e.g., 'Resident')
 * @param paramName - Name of the route parameter (default: 'id')
 * @param estateIdField - Name of the estate_id field in the model (default: 'estate_id')
 */
export const requireResourceInEstate = (
  modelPath: string,
  modelName: string,
  paramName: string = 'id',
  estateIdField: string = 'estate_id'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.estate_id) {
      return res.status(403).json({ 
        error: 'Estate association required',
        code: 'NO_ESTATE_ASSOCIATION'
      });
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      return res.status(400).json({ error: `${paramName} is required` });
    }

    try {
      // Dynamically import the model
      const modelModule = await import(`../../modules/${modelPath}`);
      const Model = modelModule[modelName];

      if (!Model) {
        console.error(`Model ${modelName} not found in ${modelPath}`);
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Query with estate isolation
      const resource = await Model.findOne({
        where: { 
          id: resourceId,
          [estateIdField]: req.user.estate_id
        },
        attributes: ['id', estateIdField]
      });

      if (!resource) {
        // Log potential IDOR attempt
        console.warn('🚨 Potential IDOR attempt detected', {
          userId: req.user.id,
          userEstateId: req.user.estate_id,
          requestedResourceId: resourceId,
          modelName,
          ip: req.ip,
          path: req.path,
          method: req.method
        });

        return res.status(404).json({ 
          error: `${modelName} not found or access denied`,
          code: 'RESOURCE_NOT_FOUND_OR_FORBIDDEN'
        });
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      console.error(`Estate scope validation error for ${modelName}:`, error);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

/**
 * Validates resource ownership (user owns the resource)
 * 
 * @param modelPath - Path to model file
 * @param modelName - Name of the model class
 * @param paramName - Name of the route parameter (default: 'id')
 * @param userIdField - Name of the user_id field in the model (default: 'user_id')
 */
export const requireResourceOwnership = (
  modelPath: string,
  modelName: string,
  paramName: string = 'id',
  userIdField: string = 'user_id'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      return res.status(400).json({ error: `${paramName} is required` });
    }

    try {
      const modelModule = await import(`../../modules/${modelPath}`);
      const Model = modelModule[modelName];

      if (!Model) {
        console.error(`Model ${modelName} not found in ${modelPath}`);
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const resource = await Model.findOne({
        where: { 
          id: resourceId,
          [userIdField]: req.user.id
        },
        attributes: ['id', userIdField]
      });

      if (!resource) {
        console.warn('Unauthorized resource access attempt', {
          userId: req.user.id,
          requestedResourceId: resourceId,
          modelName,
          ip: req.ip
        });

        return res.status(404).json({ 
          error: `${modelName} not found or access denied`,
          code: 'RESOURCE_NOT_FOUND_OR_FORBIDDEN'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error(`Ownership validation error for ${modelName}:`, error);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

/**
 * Combines estate scope and ownership checks
 * Resource must belong to user's estate AND be owned by the user
 * 
 * @param modelPath - Path to model file
 * @param modelName - Name of the model class
 * @param paramName - Name of the route parameter (default: 'id')
 * @param estateIdField - Name of the estate_id field (default: 'estate_id')
 * @param userIdField - Name of the user_id field (default: 'user_id')
 */
export const requireEstateAndOwnership = (
  modelPath: string,
  modelName: string,
  paramName: string = 'id',
  estateIdField: string = 'estate_id',
  userIdField: string = 'user_id'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.estate_id) {
      return res.status(403).json({ 
        error: 'Estate association required',
        code: 'NO_ESTATE_ASSOCIATION'
      });
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      return res.status(400).json({ error: `${paramName} is required` });
    }

    try {
      const modelModule = await import(`../../modules/${modelPath}`);
      const Model = modelModule[modelName];

      if (!Model) {
        console.error(`Model ${modelName} not found in ${modelPath}`);
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const resource = await Model.findOne({
        where: { 
          id: resourceId,
          [estateIdField]: req.user.estate_id,
          [userIdField]: req.user.id
        }
      });

      if (!resource) {
        console.warn('Unauthorized estate and ownership access attempt', {
          userId: req.user.id,
          userEstateId: req.user.estate_id,
          requestedResourceId: resourceId,
          modelName,
          ip: req.ip
        });

        return res.status(404).json({ 
          error: `${modelName} not found or access denied`,
          code: 'RESOURCE_NOT_FOUND_OR_FORBIDDEN'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error(`Estate and ownership validation error:`, error);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

/**
 * Scopes query to user's estate
 * Adds estate_id filter to req.query for use in controllers
 */
export const scopeQueryToEstate = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.estate_id) {
    return res.status(403).json({ 
      error: 'Estate association required',
      code: 'NO_ESTATE_ASSOCIATION'
    });
  }

  // Add estate_id to query params
  req.query.estate_id = req.user.estate_id;
  next();
};

// Extend AuthRequest interface
declare module './auth.middleware' {
  interface AuthRequest {
    resource?: any;
  }
}
