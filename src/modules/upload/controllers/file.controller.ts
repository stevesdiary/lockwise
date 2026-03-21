import { Request, Response } from 'express';
import { cloudStorage } from '../services/cloud-storage.service';

export const serveFile = async (req: Request, res: Response) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    
    const signedUrl = await cloudStorage.getSignedUrl(key, 3600);
    res.redirect(signedUrl);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
};