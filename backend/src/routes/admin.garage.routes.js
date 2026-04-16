const express = require("express");
const router = express.Router();
const adminGarageController = require("../controllers/admin.garage.controller");
const { authRequired, requireRole } = require("../middleware/auth.middleware");

router.use(authRequired);
router.use(requireRole("admin"));

router.get("/stats", adminGarageController.getGlobalGarageStats);
router.get("/workshops", adminGarageController.listAllWorkshops);
router.get("/bills", adminGarageController.listAllServiceBills);

module.exports = router;
