import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { asString } from '../../../shared/utils/param.util';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: "Registration failed on server" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const caller = (req as any).user;
    const callerRole = (caller?.role as string)?.toLowerCase() || '';
    const isAdmin = ['master', 'super_admin', 'admin'].includes(callerRole);

    // Managers are always scoped to their own estate — ignore any query param
    const estateId = isAdmin
      ? (req.query.estate_id as string | undefined)
      : caller?.estate_id;

    if (!isAdmin && !estateId) {
      return res.status(403).json({ error: 'No estate associated with your account' });
    }

    const result = await userService.getAllUsers(estateId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUserById(asString(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const targetUserId = asString(req.params.id);
    const currentUser = (req as any).user;

    // Prevent privilege escalation: users can only update themselves unless they're admin
    if (currentUser.role !== "admin" && currentUser.id !== targetUserId) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Cannot update other users" });
    }

    // Prevent role escalation: non-admins cannot change roles
    if (req.body.role && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Cannot modify user roles" });
    }

    // Prevent user_type escalation
    if (req.body.user_type && currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Cannot modify user type" });
    }

    const result = await userService.updateUser(targetUserId, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const targetUserId = asString(req.params.id);
    const currentUser = (req as any).user;

    // Prevent self-deletion
    if (currentUser.id === targetUserId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Only admins can delete users
    if (currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Only admins can delete users" });
    }

    const result = await userService.deleteUser(
      req.body.estate_id,
      targetUserId,
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file provided" });
    }

    const userId = (req as any).user.id;
    const result = await userService.uploadAvatar(userId, req.file);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ success: false, error: "Failed to upload avatar" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    console.log('Update profile request received');
    console.log('Request body:', req.body);
    console.log('User:', (req as any).user);
    
    const userId = (req as any).user.id;
    const { first_name, last_name, phone } = req.body;

    if (!userId) {
      console.log('No userId found');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log('Updating profile for user:', userId);
    const result = await userService.updateProfile(userId, { first_name, last_name, phone });
    console.log('Profile update result:', result);
    
    res.status(result.statusCode).json(result);
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile", message: error.message });
  }
};

export const linkUserToEstate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.params.userId;
    const { estate_code, unit_id } = req.body;

    if (!estate_code) {
      return res.status(400).json({ success: false, message: 'Estate code is required' });
    }

    const result = await userService.linkUserToEstate(userId, estate_code, unit_id);
    res.status(result.statusCode).json({
      success: result.statusCode === 200,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to link user to estate' });
  }
};

export const getPendingResidents = async (req: Request, res: Response) => {
  try {
    const estateId = (req as any).user?.estate_id;
    if (!estateId) {
      return res.status(400).json({ success: false, message: 'No estate associated with your account' });
    }
    const result = await userService.getPendingResidents(estateId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending residents' });
  }
};

export const approveJoinRequest = async (req: Request, res: Response) => {
  try {
    const approverId = (req as any).user?.id;
    const targetUserId = asString(req.params.userId);
    if (!targetUserId) return res.status(400).json({ success: false, message: 'User ID required' });
    const result = await userService.approveJoinRequest(targetUserId, approverId);
    res.status(result.statusCode).json({ success: result.statusCode === 200, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve join request' });
  }
};

export const rejectJoinRequest = async (req: Request, res: Response) => {
  try {
    const approverId = (req as any).user?.id;
    const targetUserId = asString(req.params.userId);
    const { reason } = req.body;
    if (!targetUserId) return res.status(400).json({ success: false, message: 'User ID required' });
    const result = await userService.rejectJoinRequest(targetUserId, approverId, reason);
    res.status(result.statusCode).json({ success: result.statusCode === 200, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject join request' });
  }
};

export const getCurrentUserEstate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await userService.getCurrentUserEstate(userId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch estate details' });
  }
};
