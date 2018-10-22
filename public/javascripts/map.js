document.addEventListener("DOMContentLoaded", function () {
  mapboxgl.accessToken = "pk.eyJ1IjoiZHBhd3NvbjkwNSIsImEiOiJjam5mYXNlMWIwMTBoM3dwanc3YXBjcHNiIn0.8j9k2iEJpirCV6EgrUZ4Vg";
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: foundCustomer[0].coordinates,
    zoom: 14
  });

  // create a HTML element for our post location
  var el = document.createElement('div');
  el.className = 'marker';

  // make a marker for our location and add to the map
  new mapboxgl.Marker(el)
    .setLngLat(foundCustomer[0].coordinates)
    .setPopup(new mapboxgl.Popup({
        offset: 25
      }) // add popups
      .setHTML('<h4>' + foundCustomer[0].firstName + ' ' + foundCustomer[0].lastName + '</h4><p>' + foundCustomer.address + '</p>'))
    .addTo(map);
});