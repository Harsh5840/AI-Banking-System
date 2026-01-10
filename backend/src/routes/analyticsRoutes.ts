import { RequestHandler, Router } from "express";
import {
  handleTotalSpending,
  handleTopCategories,
  handleMonthlyTrend,
  handleFlaggedOrRisky,
} from "../controllers/analyticsController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { validateQuery } from "../middleware/validateQuery";
import {
  totalSpendingQuerySchema,
  topCategoriesQuerySchema,
  monthlyTrendQuerySchema,
  flaggedQuerySchema,
} from "../validators/analyticsSchema";

const router: Router = Router();

// All analytics routes require authentication
router.use(authenticateJWT as RequestHandler);

// GET /analytics/total?userId=...&category=...&month=...&year=...
router.get(
  "/total",
  requireRole("EMPLOYEE", "SYSTEM_ADMIN") as RequestHandler,
  // validateQuery(totalSpendingQuerySchema) as RequestHandler,
  handleTotalSpending
);

// GET /analytics/top-categories?userId=...&month=...&year=...&limit=...
router.get(
  "/top-categories",
  requireRole("EMPLOYEE", "SYSTEM_ADMIN") as RequestHandler,
  // validateQuery(topCategoriesQuerySchema) as RequestHandler,
  handleTopCategories 
);

// GET /analytics/monthly-trend?userId=...
router.get(
  "/monthly-trend",
  requireRole("EMPLOYEE", "SYSTEM_ADMIN") as RequestHandler,
  // validateQuery(monthlyTrendQuerySchema)        as RequestHandler,
  handleMonthlyTrend as RequestHandler
);

// GET /analytics/flagged?userId=...
router.get(
  "/flagged",
  requireRole("EMPLOYEE", "SYSTEM_ADMIN", "FINANCE_MANAGER") as RequestHandler,
  // validateQuery(flaggedQuerySchema) as RequestHandler,
  handleFlaggedOrRisky as RequestHandler
);

export default router;
