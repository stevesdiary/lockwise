// Auth Module Exports
export * from './controllers/login.controller';
export * from './controllers/google-auth.controller';
export * from './controllers/password-reset.controller';

export * from './services/auth.service';
export * from './services/login.service';
export * from './services/google-auth.service';
export * from './services/password-reset.service';
export * from './services/session.service';
export * from './services/verify.service';

export * from './middleware/auth.middleware';
export * from './middleware/permission.middleware';

export * from './models/user.model';
export * from './models/role.model';
export * from './models/permission.model';

export * from './repositories/user.repository';
export * from './repositories/role.repository';
export * from './repositories/permission.repository';

// Route exports
import loginRouter from './routes/login.route';
import googleAuthRouter from './routes/google-auth.route';
import passwordResetRouter from './routes/password-reset.route';
import userRouter from './routes/user.route';
import phoneVerificationRouter from './routes/phone-verification.route';
import emailVerificationRouter from './routes/email-verification.route';

export const authRoutes = {
  loginRouter,
  googleAuthRouter,
  passwordResetRouter,
  userRouter,
  phoneVerificationRouter,
  emailVerificationRouter
};
