const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth.middleware");
const adminSalesController = require("../controllers/admin.sales.controller");

const router = express.Router();

router.use(authRequired);
router.use(requireRole("admin"));

router.get("/", adminSalesController.listSales);
router.post("/", adminSalesController.createSale);
router.patch("/:id/payment", adminSalesController.addPayment);

module.exports = router;
