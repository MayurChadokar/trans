const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth.middleware");
const adminTransportController = require("../controllers/admin.transport.controller");

const router = express.Router();

// All routes require "admin" role
router.use(authRequired);
router.use(requireRole("admin"));

router.get("/bills", adminTransportController.getAllBills);
router.get("/fleet", adminTransportController.getGlobalFleet);
router.get("/analytics", adminTransportController.getSalesAnalytics);
router.get("/trips", adminTransportController.getGlobalTripHistory);

module.exports = router;
