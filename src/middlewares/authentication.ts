import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/type';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as any; // Attach decoded user to request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};



const secret: string = process.env.JWT_SECRET || 'secret';

const authentication = (req: Request, res: Response, next: NextFunction) => {
	if (!secret) {
		throw new Error('JWT_SECRET must be defined in environment variables');
	}
	let token;
	token = req.headers.authorization?.split(' ')[1] as string;
	if (!token) {
			res.status(401).json({ message: 'No token provided' });
		}
	try {
		const decoded = jwt.verify(token, secret as string) as JwtPayload;
		if (!decoded) {
			res.status(401).json({ message: 'Unauthorized' });
			return;
		}
		
		req.user = decoded //as  { id: string; role: UserRole };
		next();

	} catch (error) {
		console.error('AUTHENTICATION ERROR:', error);
		res.status(401).send({ error: 'Please authenticate.' });
	}
};
export default authentication;
