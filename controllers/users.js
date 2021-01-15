const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectURL = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectURL);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  req.flash("success", "Successfully logged out");
  res.redirect("/campgrounds");
};
