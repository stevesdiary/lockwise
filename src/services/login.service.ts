import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ 
    where: { email }
   });
  
  if (!user) {
    return {
      statusCode: 401,
      message: 'Invalid email or password'
    };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return {
      statusCode: 401,
      message: 'Invalid email or password'
    };
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
  );

  return {
    statusCode: 200,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.first_name
    }
  };
};