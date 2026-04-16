const express = require("express");
const router = express.Router();
const financeController = require("../controllers/finance.controller");
const { authRequired } = require("../middleware/auth.middleware");

// Secure all finance routes
router.use(authRequired);

router.get("/stats", financeController.getFinanceStats);
router.get("/", financeController.listTransactions);
router.post("/", financeController.addTransaction);

module.exports = router;
