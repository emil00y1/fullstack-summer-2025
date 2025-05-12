const request = require("supertest");
const baseURL = "http://localhost:3000"; // Assuming the app is running on port 3000

describe("API Endpoints", () => {
  it("should return 200 OK for /api/users", async () => {
    const res = await request(baseURL).get("/api/users");
    expect(res.statusCode).toEqual(200);
  });

  it("should return 404 Not Found for a non-existent route", async () => {
    const res = await request(baseURL).get("/api/non-existent-route");
    expect(res.statusCode).toEqual(404);
  });
});

describe("Authentication Endpoints", () => {
  it("should successfully sign up a new user", async () => {
    const timestamp = Date.now();
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: "Passwo!rd123",
    };
    const res = await request(baseURL).post("/api/auth/signup").send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "Account created successfully");
  });
});
