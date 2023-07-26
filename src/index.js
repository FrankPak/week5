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

    let hue = Math.pow(arrivalAmount / departureAmount, 3) * 60;
    if (hue > 120) {
      hue = 120;
    }

    geoJson.features[i].properties.arrival = arrivalAmount; //rewrite it into the json
    geoJson.features[i].properties.departure = departureAmount;
    geoJson.features[i].properties.hue = hue;
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
    style: style,
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
  const name = feature.properties.name;
  const arrival = feature.properties.arrival;
  const departure = feature.properties.departure;
  console.log(feature.properties);

  layer.bindPopup(
    `<ul> ${name}
            <li> Migartion: ${arrival}</li>
            <li> Depature: ${departure}</li>
        </ul>`
  );

  layer.bindTooltip(name).openTooltip();
  //console.log(name);
};

function style(feature) {
  return {
    color: `hsl(${feature.properties.hue},75% 50%)`,
  };
}

//function getHue() {}

fetchData();
