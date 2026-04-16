const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth.middleware");
const adminDashboardController = require("../controllers/admin.dashboard.controller");

const router = express.Router();

router.use(authRequired);
router.use(requireRole("admin"));

router.get("/stats", adminDashboardController.getStats);
router.get("/activity", adminDashboardController.getRecentActivity);

module.exports = router;
