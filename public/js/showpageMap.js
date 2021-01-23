mapboxgl.accessToken = mapToken;
console.log(mapToken);
console.log(campground.geometry);
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
  center: new mapboxgl.LngLat(
    campground.geometry.coordinates[0],
    campground.geometry.coordinates[1]
  ), // starting position [lng, lat]
  zoom: 9, // starting zoom
});
new mapboxgl.Marker()
  .setLngLat(
    new mapboxgl.LngLat(
      campground.geometry.coordinates[0],
      campground.geometry.coordinates[1]
    )
  )
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
  )
  .addTo(map);
