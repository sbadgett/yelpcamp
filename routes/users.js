const express = require("express");
const catchAsync = require("../util/catchAsync");
const ExpressError = require("../util/ExpressError");
const passport = require("passport");
const users = require("../controllers/users");

const router = express.Router();

router.get("/register", users.renderRegister);

router.post("/register", catchAsync(users.createUser));

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.loginUser
);

router.get("/logout", users.logoutUser);

module.exports = router;
