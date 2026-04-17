const express = require("express");
const { authRequired } = require("../middleware/auth.middleware");
const planController = require("../controllers/plan.controller");

const router = express.Router();

// Publicly reachable but needs authentication
router.use(authRequired);

router.get("/available", planController.getAvailablePlans);
router.post("/subscribe", planController.subscribeToPlan);
router.post("/create-order", planController.createOrder);
router.post("/verify-payment", planController.verifyPayment);

module.exports = router;
