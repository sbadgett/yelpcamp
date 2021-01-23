const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

//Edit URL so that max width of images is 200 pixels, used on edit campsite page
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

//When converting object to JSON, have it include virtuals for use in maps
const options = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    description: String,
    location: String,
    //geometry field is formatted as GeoJSON for map feature
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    images: [ImageSchema],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  options
);

//Virtual property formatting text for pop ups in cluster map
CampgroundSchema.virtual("properties.popUpText").get(function () {
  return `<a href="/campgrounds/${this._id}"> ${this.title} <a>`;
});

CampgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground.reviews) {
    //Delete reviews associated with this campsite
    await Review.deleteMany({
      _id: {
        $in: campground.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
