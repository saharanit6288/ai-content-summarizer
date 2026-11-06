import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("API Authentication Integration Tests", () => {
  it("should reject summary history without authentication", async () => {
    const response = await request(app)
      .get("/api/summaries");

    expect(response.status).toBe(401);
  });

  it("should reject summary creation without authentication", async () => {
    const response = await request(app)
      .post("/api/summaries")
      .send({
        inputText: "This is a test article containing more than one hundred characters for the summary API.",
        wordLimit: 100,
      });

    expect(response.status).toBe(401);
  });

  it("should reject document upload without authentication", async () => {
    const response = await request(app)
      .post("/api/summaries/from-file");

    expect(response.status).toBe(401);
  });
});