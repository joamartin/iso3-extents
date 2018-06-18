var fs = require('fs');
var bbox = require('@turf/bbox');

function reduceUnits(acc, curr) {
  var ISO3 = curr.properties.ISO_A3 !== '-99' ? curr.properties.ISO_A3
    : curr.properties.ADM0_A3_IS !== '-99' ? curr.properties.ADM0_A3_IS
    : curr.properties.ADM0_A3_US;

  var geojson = acc[ISO3] || { type: "FeatureCollection", features: [] };
  geojson.features.push(curr)
  acc[ISO3] = geojson;
  return acc;
}

function main() {
  var iso3Extents = {}, iso2Extents = {};
  var unitsGeojson = JSON.parse(fs.readFileSync('./units.geojson'));  
  var iso3Iso2Json = JSON.parse(fs.readFileSync('./iso3-iso2.json'));

  var iso3ToIso2 = iso3Iso2Json.reduce(function(acc, curr) {
    acc[curr.ISO3] = curr.ISO2;
    return acc;
  }, {}); 

  var ISO3s = unitsGeojson.features.reduce(reduceUnits, {});

  Object.keys(ISO3s).forEach(function(ISO3) {
    var geojson = ISO3s[ISO3];
    iso3Extents[ISO3] = bbox(geojson);
    iso2Extents[iso3ToIso2[ISO3]] = iso3Extents[ISO3];
  });

  fs.writeFileSync('iso3-extents.json', JSON.stringify(iso3Extents));
  fs.writeFileSync('iso2-extents.json', JSON.stringify(iso2Extents));
}

main();