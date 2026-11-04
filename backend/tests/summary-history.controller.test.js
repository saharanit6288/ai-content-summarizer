
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    summary: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}));

import { prisma } from "../src/config/prisma.js";

import {
  getSummaryHistoryController,
  getSummaryByIdController,
  deleteSummaryController
} from "../src/controllers/summary-history.controller.js";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Summary history controller", () => {
  it("returns only the authenticated user's summaries", async () => {
    const req = {
      user: { id: "user-123" },
      query: { page: "1", limit: "10" }
    };

    const res = createResponse();

    prisma.summary.findMany.mockResolvedValue([
      { id: "summary-1", sourceType: "TEXT" }
    ]);

    prisma.summary.count.mockResolvedValue(1);

    await getSummaryHistoryController(req, res);

    expect(prisma.summary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123" },
        skip: 0,
        take: 10
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("filters summaries by source type", async () => {
    const req = {
      user: { id: "user-123" },
      query: {
        page: "1",
        limit: "10",
        sourceType: "PDF"
      }
    };

    const res = createResponse();

    prisma.summary.findMany.mockResolvedValue([]);
    prisma.summary.count.mockResolvedValue(0);

    await getSummaryHistoryController(req, res);

    expect(prisma.summary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-123",
          sourceType: "PDF"
        }
      })
    );
  });

  it("rejects an invalid page number", async () => {
    const req = {
      user: { id: "user-123" },
      query: { page: "0" }
    };

    const res = createResponse();

    await getSummaryHistoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.summary.findMany).not.toHaveBeenCalled();
  });

  it("returns an individual summary belonging to the user", async () => {
    const req = {
      user: { id: "user-123" },
      params: { id: "summary-1" }
    };

    const res = createResponse();

    prisma.summary.findFirst.mockResolvedValue({
      id: "summary-1",
      userId: "user-123"
    });

    await getSummaryByIdController(req, res);

    expect(prisma.summary.findFirst).toHaveBeenCalledWith({
      where: {
        id: "summary-1",
        userId: "user-123"
      },
      include: {
        aiModelRun: true
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when a summary does not belong to the user", async () => {
    const req = {
      user: { id: "user-123" },
      params: { id: "another-users-summary" }
    };

    const res = createResponse();

    prisma.summary.findFirst.mockResolvedValue(null);

    await getSummaryByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deletes only the authenticated user's summary", async () => {
    const req = {
      user: { id: "user-123" },
      params: { id: "summary-1" }
    };

    const res = createResponse();

    prisma.summary.deleteMany.mockResolvedValue({ count: 1 });

    await deleteSummaryController(req, res);

    expect(prisma.summary.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "summary-1",
        userId: "user-123"
      }
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when deleting another user's summary", async () => {
    const req = {
      user: { id: "user-123" },
      params: { id: "another-users-summary" }
    };

    const res = createResponse();

    prisma.summary.deleteMany.mockResolvedValue({ count: 0 });

    await deleteSummaryController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
