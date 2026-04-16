const express = require("express");
const router = express.Router();
const partyController = require("../controllers/party.controller");
const { authRequired } = require("../middleware/auth.middleware");

router.use(authRequired);

router.get("/", partyController.listParties);
router.post("/", partyController.createParty);
router.patch("/:id", partyController.updateParty);
router.delete("/:id", partyController.deleteParty);

module.exports = router;
