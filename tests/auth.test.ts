import request from 'supertest';
import { app } from '../src/app';
import { dbService } from '../src/services/database.service';

describe('Authentication API', () => {
  beforeAll(async () => {
    // Setup test database
    await dbService.query('DELETE FROM users WHERE email LIKE %test%');
  });

  afterAll(async () => {
    await dbService.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@lockwise.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should enforce rate limiting', async () => {
      const requests = Array(6).fill().map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];
      
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('POST /api/v1/users/register', () => {
    it('should register new user', async () => {
      const userData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '+2348012345678',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'admin@lockwise.com',
          phone: '+2348012345679',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });
  });
});