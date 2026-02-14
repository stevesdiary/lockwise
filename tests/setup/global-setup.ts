// Global setup for Jest tests
export default async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_key';
};
