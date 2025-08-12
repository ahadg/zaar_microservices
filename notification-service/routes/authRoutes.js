// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const router = express.Router();

// Google Auth Start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    res.cookie("token", req.user.token);
    res.cookie("user", req.user.user);
    res.redirect(`${process.env.UI}/login`);
  }
);

// Logout Route
router.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.status(200).json({ message: "Logged out successfully" });
});

// Failed Auth
router.get("/failed", (req, res) => {
  res.status(401).send("Authentication Failed");
});

// Optionally: Logged-in User Info
router.get("/me", (req, res) => {
  if (!req.user) return res.sendStatus(401);
  res.json(req.user);
});

module.exports = router;
