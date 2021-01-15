const express = require("express");
const Campground = require("../models/campground");
const User = require("../models/user");
const catchAsync = require("../util/catchAsync");
const ExpressError = require("../util/ExpressError");
const passport = require("passport");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudinary");
const upload = multer({ storage });

const {
  isLoggedIn,
  validateCampground,
  validateOwner,
} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");

const router = express.Router();

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .delete(isLoggedIn, validateOwner, catchAsync(campgrounds.deleteCampground))
  .put(
    isLoggedIn,
    validateOwner,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.editCampground)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  validateOwner,
  catchAsync(campgrounds.showEditCampground)
);

module.exports = router;
