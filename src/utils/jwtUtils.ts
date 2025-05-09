import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'secret';

export const decodeToken = (token: string) => {
	try {
		const decoded = jwt.verify(token, jwtSecret as string) as any;
		return decoded;
	} catch (error) {
		return null;
	}
};
