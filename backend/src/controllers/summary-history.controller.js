
import { prisma } from "../config/prisma.js";

import {
  summaryHistoryQuerySchema,
  summaryIdSchema
} from "../validators/summary-history.validator.js";

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
export async function getSummaryByIdController(req, res) {
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
      return res.status(404).json({
        success: false,
        message: "Summary not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Get summary by ID failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve summary."
    });
  }
}

// DELETE /api/summaries/:id
export async function deleteSummaryController(req, res) {
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
      return res.status(404).json({
        success: false,
        message: "Summary not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Summary deleted successfully."
    });
  } catch (error) {
    console.error("Delete summary failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete summary."
    });
  }
}
