//if (process.env.NODE_ENV !== "production") {
require("dotenv").config();
//}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const ExpressError = require("./util/ExpressError");
const methodOverride = require("method-override");
const Joi = require("joi");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const local = require("passport-local");
const User = require("./models/user");
const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

//MongoDB connection
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

//Configure app for EJS
app.engine("ejs", engine);
app.set("view engine", "ejs");

//Set path to get to views
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(sanitize());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

//Set up and initialize session attributes
const sessionConfig = {
  name: "session",
  secret: "secretCode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//Configure app to use passport for managing user and user authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new local(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware to add additional fields into each res
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Configure app to use different routes
app.use("/", userRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/campgrounds", campgroundRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong.";
  res.render("error", { err });
});

app.listen(3000, () => {
  console.log("YelpCamp listening on port 3000.");
});
