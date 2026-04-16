const express = require("express");
const router = express.Router();
const garageController = require("../controllers/garage.controller");
const { authRequired, requireRole } = require("../middleware/auth.middleware");

router.use(authRequired);
router.use(requireRole("garage"));

router.get("/stats", garageController.getStats);
router.get("/vehicles", garageController.listVehicles);
router.post("/vehicles", garageController.addVehicle);
router.delete("/vehicles/:id", garageController.deleteVehicle);

module.exports = router;
