const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profile.controller");
const { authRequired } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

router.get("/", authRequired, getProfile);
router.get("/business", authRequired, getProfile); // Alias for clarity

// Support logo and signature uploads simultaneously
router.patch(
  "/",
  authRequired,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateProfile
);

// Specific route for business updates
router.patch(
  "/business",
  authRequired,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateProfile
);

module.exports = router;
