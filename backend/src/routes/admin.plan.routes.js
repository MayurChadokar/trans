const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth.middleware");
const adminPlanController = require("../controllers/admin.plan.controller");

const router = express.Router();

router.use(authRequired);
router.use(requireRole("admin"));

router.get("/", adminPlanController.listPlans);
router.post("/", adminPlanController.createPlan);
router.patch("/:id", adminPlanController.updatePlan);
router.delete("/:id", adminPlanController.deletePlan);

module.exports = router;
