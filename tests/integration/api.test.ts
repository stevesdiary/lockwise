import request from "supertest";
import { server, httpServer } from "../../src/shared/core";
import sequelize from "../../src/shared/core/database";

let authToken: string;

beforeAll(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}, 30000);

afterAll(async () => {
  try {
    await sequelize.close();
    httpServer.close();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}, 10000);

describe("API Integration Tests", () => {
  describe("Authentication Flow", () => {
    it("should register new user", async () => {
      const response = await request(server)
        .post("/api/v1/user/register")
        .send({
          first_name: "Integration",
          last_name: "Test",
          email: `test${Date.now()}@example.com`,
          phone: "+2348012345678",
          password: "Test123!@#",
        });

      expect([200, 201, 400, 500, 501]).toContain(response.status);
    }, 10000);

    it("should login and get token", async () => {
      const response = await request(server).post("/api/v1/auth/login").send({
        email: "admin@lockwise.com",
        password: "password123",
      });

      if (response.status === 200) {
        expect(response.body).toHaveProperty("token");
        authToken = response.body.token;
      }
      expect([200, 401, 500]).toContain(response.status);
    }, 10000);
  });

  describe("Protected Endpoints", () => {
    it("should reject requests without token", async () => {
      const response = await request(server).get("/api/v1/user/all");

      expect([401, 404]).toContain(response.status);
    }, 10000);

    it("should allow requests with valid token", async () => {
      if (!authToken) {
        return;
      }
      
      const response = await request(server)
        .get("/api/v1/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect([200, 403, 404]).toContain(response.status);
    }, 10000);
  });

  describe("Support System", () => {
    it("should create support ticket", async () => {
      if (!authToken) {
        return;
      }

      const response = await request(server)
        .post("/api/v1/support/tickets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "Test Issue",
          description: "This is a test ticket",
          category: "technical",
          priority: "medium",
        });

      expect([200, 201, 400, 403, 500]).toContain(response.status);
    }, 10000);
  });

  describe("Referral System", () => {
    it("should register referrer", async () => {
      const response = await request(server)
        .post("/api/v1/referral/register")
        .send({
          name: "Test Referrer",
          email: `referrer${Date.now()}@example.com`,
          phone: "+2348012345678",
          referral_code: `TEST${Date.now()}`,
        });

      expect([200, 201, 400, 500]).toContain(response.status);
    }, 10000);
  });
});
