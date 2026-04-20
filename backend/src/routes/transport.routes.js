const express = require("express");
const router = express.Router();
const transportController = require("../controllers/transport.controller");
const { authRequired, requireRole } = require("../middleware/auth.middleware");

// All transport routes require authentication and the "transport" role
router.use(authRequired);
router.use(requireRole("transport"));

router.get("/stats", transportController.getTransportStats);
router.get("/vehicles", transportController.listVehicles);
router.get("/vehicles/:id", transportController.getVehicleDetail);
router.post("/vehicles", transportController.createVehicle);
router.patch("/vehicles/:id", transportController.updateVehicle);

router.get("/trips", transportController.listTrips);
router.post("/trips", transportController.createTrip);
router.patch("/trips/:id", transportController.updateTrip);
router.delete("/trips/:id", transportController.deleteTrip);

module.exports = router;
