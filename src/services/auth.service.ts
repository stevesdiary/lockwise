import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return { statusCode: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email }, 
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  return { 
    statusCode: 200, 
    message: 'Login successful', 
    token,
    user: { id: user.id, email: user.email }
  };
};