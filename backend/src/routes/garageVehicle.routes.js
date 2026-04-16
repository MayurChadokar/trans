const express = require("express");
const router = express.Router();
const garageVehicleController = require("../controllers/garageVehicle.controller");

router.get("/", garageVehicleController.listVehicles);
router.post("/", garageVehicleController.createVehicle);
router.patch("/:id", garageVehicleController.updateVehicle);
router.delete("/:id", garageVehicleController.deleteVehicle);

module.exports = router;
