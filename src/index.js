import "./styles.css";
const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const geoData = await fetch(url);
  const geoJson = await geoData.json();

  const migrationURL =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const migrationData = await fetch(migrationURL);
  const migrationJson = await migrationData.json();
  const migrationIndex =
    migrationJson.dataset.dimension.Tuloalue.category.index;

  //console.log(migrationIndex["KU018"]);
  console.log(migrationJson);

  const departureURL =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const departureData = await fetch(departureURL);
  const departureJson = await departureData.json();
  const departureIndex =
    departureJson.dataset.dimension.Lähtöalue.category.index;

  //console.log(geoJson.features);
  console.log(departureJson);

  for (let i in geoJson.features) {
    let kunta = geoJson.features[i].properties.kunta;
    let arrivalindex = migrationIndex["KU" + kunta];
    let departureindex = departureIndex["KU" + kunta];

    let arrivalAmount = migrationJson.dataset.value[arrivalindex];
    let departureAmount = departureJson.dataset.value[departureindex];

    geoJson.features[i].properties.arrival = arrivalAmount; //rewrite it into the json
    geoJson.features[i].properties.departure = departureAmount;
  }

  console.log(geoJson.features);

  initMap(geoJson);
};

const initMap = (geoData) => {
  let map = L.map("map", {
    minZoom: -3,
  });

  let geoJson = L.geoJSON(geoData, {
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
  if (!feature.id) return;
  const id = feature.id;
  const kunta = feature.properties.kunta;
  const name = feature.properties.name;
  const posMig = feature.properties.arrival;
  const negMig = feature.properties.departure;
  console.log(feature.properties);

  layer.bindPopup(
    `<ul> ${name}
            <li> Migartion: ${posMig}</li>
            <li> Deprature: ${negMig}</li>
        </ul>`
  );

  layer.bindTooltip(name).openTooltip();
  //console.log(name);
};

fetchData();
