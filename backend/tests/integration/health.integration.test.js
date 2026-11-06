import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Health API Integration Tests", () => {
  it("should return 200 for health endpoint", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("should return a successful database health response", async () => {
    const response = await request(app)
      .get("/api/db-health");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});