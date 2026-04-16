const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth.middleware");
const adminSpecialController = require("../controllers/admin.special.controller");

const router = express.Router();

router.use(authRequired);
router.use(requireRole("admin"));

router.get("/", adminSpecialController.listSpecialUsers);
router.post("/", adminSpecialController.createSpecialUser);
router.patch("/:id", adminSpecialController.updateSpecialUser);
router.delete("/:id", adminSpecialController.deleteSpecialUser);

module.exports = router;
