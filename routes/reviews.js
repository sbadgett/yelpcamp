const express = require("express");
const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require("../util/catchAsync");
const reviews = require("../controllers/reviews");
const {
  isLoggedIn,
  validateReview,
  validateReviewOwner,
} = require("../middleware");

const router = express.Router({ mergeParams: true });

router.delete(
  "/:reviewId",
  isLoggedIn,
  validateReviewOwner,
  catchAsync(reviews.deleteReview)
);

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

module.exports = router;
