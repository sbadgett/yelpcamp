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

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
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
