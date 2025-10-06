import { Request, Response } from 'express';

class ConfigController {
  async getMapConfig(req: Request, res: Response) {
    return res.status(200).json({
      status: 'success',
      data: {
        apiKey: process.env.MAP_API_KEY,
        mapId: process.env.MAP_ID || 'DEMO_MAP_ID'
      }
    });
  }
}

export default new ConfigController();