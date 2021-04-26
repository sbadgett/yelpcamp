const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
  //Use mapbox geocoder to get the coordinates for the inputted location
  const geoCodeRes = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  //Extract coordinates from the geocoder response
  const geoLoc = geoCodeRes.body.features[0].geometry;
  const campground = new Campground(req.body.campground);
  campground.geometry = geoLoc;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.owner = req.user._id;
  await campground.save();
  req.flash("success", "Successfully created a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "owner" } })
    .populate("owner");
  if (!campground) {
    req.flash("error", "Campground could not be found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  //Look up existing campground and update data with inputs from req.body.campground
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  //Add new images to campground.images
  campground.images.push(
    ...req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }))
  );
  //Delete images that have been selected for removal from campground and cloudinary
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  //Save to db
  await campground.save();
  req.flash("success", "Successfully updated the campground!");
  //Redirect to show campground view for this campground
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the campground!");
  res.redirect("/campgrounds");
};

module.exports.showEditCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground could not be found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};
