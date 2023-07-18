import "./styles.css";
//let map = L.map("map").setView([61.06, 28.09], 13);

/*let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: -3,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
*/
const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const geoData = await fetch(url);
  const geoJson = await geoData.json();

  initMap(geoJson);
};

const initMap = (data) => {
  let map = L.map("map", {
    minZoom: -3,
  });

  let geoJson = L.geoJSON(data, {
    weight: 2,
    onEachFeature: getFeature,
  }).addTo(map);

  let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const getFeature = (feature, layer) => {
    if(!feature.id) return;
    const name = feature.properties.name;

    layer.bindTooltip(name).openTooltip();
    console.log(name)
}
fetchData();
