
import { prisma } from "../config/prisma.js";

import {
  summaryHistoryQuerySchema,
  summaryIdSchema
} from "../validators/summary-history.validator.js";
import { AppError } from "../utils/app-error.js";

// GET /api/summaries
export async function getSummaryHistoryController(req, res) {
  try {
    const validation = summaryHistoryQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters.",
        errors: validation.error.flatten()
      });
    }

    const {
      page,
      limit,
      sourceType,
      status
    } = validation.data;

    // Always restrict results to the authenticated user.
    const where = {
      userId: req.user.id,
      ...(sourceType && { sourceType }),
      ...(status && { status })
    };

    const skip = (page - 1) * limit;

    const [summaries, totalRecords] = await Promise.all([
      prisma.summary.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          sourceType: true,
          sourceUrl: true,
          requestedWordLimit: true,
          summaryText: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          aiModelRun: {
            select: {
              provider: true,
              model: true,
              durationMs: true,
              outputWords: true
            }
          }
        }
      }),

      prisma.summary.count({ where })
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      success: true,
      data: summaries,
      pagination: {
        totalRecords,
        currentPage: page,
        pageSize: limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get summary history failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve summary history."
    });
  }
}

// GET /api/summaries/:id
export async function getSummaryByIdController(req, res, next) {
  try {
    const validation = summaryIdSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid summary ID."
      });
    }

    const summary = await prisma.summary.findFirst({
      where: {
        id: validation.data.id,
        userId: req.user.id
      },
      include: {
        aiModelRun: true
      }
    });

    if (!summary) {
      throw new AppError("Summary not found", 404);
    }

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Get summary by ID failed:", error);
    next(error);
  }
}

// DELETE /api/summaries/:id
export async function deleteSummaryController(req, res, next) {
  try {
    const validation = summaryIdSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid summary ID."
      });
    }

    // deleteMany allows us to enforce ownership in the delete query itself.
    const result = await prisma.summary.deleteMany({
      where: {
        id: validation.data.id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      throw new AppError("Summary not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Summary deleted successfully."
    });
  } catch (error) {
    console.error("Delete summary failed:", error);
    next(error);
  }
}

export async function getSummaryStatsController(req, res, next) {
  try {
    const userId = req.user.id;

    const [
      totalSummaries,
      completedSummaries,
      failedSummaries,
      sourceTypeCounts,
      recentSummaries,
    ] = await Promise.all([
      prisma.summary.count({
        where: { userId },
      }),

      prisma.summary.count({
        where: {
          userId,
          status: "COMPLETED",
        },
      }),

      prisma.summary.count({
        where: {
          userId,
          status: "FAILED",
        },
      }),

      prisma.summary.groupBy({
        by: ["sourceType"],
        where: { userId },
        _count: {
          _all: true,
        },
      }),

      prisma.summary.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          sourceType: true,
          sourceUrl: true,
          requestedWordLimit: true,
          summaryText: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const sourceCounts = Object.fromEntries(
      sourceTypeCounts.map((item) => [
        item.sourceType,
        item._count._all,
      ])
    );

    return res.status(200).json({
      success: true,
      data: {
        totalSummaries,
        completedSummaries,
        failedSummaries,
        textSummaries: sourceCounts.TEXT || 0,
        urlSummaries: sourceCounts.URL || 0,
        pdfSummaries: sourceCounts.PDF || 0,
        docxSummaries: sourceCounts.DOCX || 0,
        recentSummaries,
      },
    });
  } catch (error) {
    next(error);
  }
}
