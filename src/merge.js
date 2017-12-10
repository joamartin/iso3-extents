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
	var unitsFileContent = fs.readFileSync('./units.geojson')	
	var unitsGeojson = JSON.parse(unitsFileContent);
	var extents = {};

	var ISO3s = unitsGeojson.features.reduce(reduceUnits, {});

	Object.keys(ISO3s).forEach(function(ISO3) {
		var geojson = ISO3s[ISO3];
		extents[ISO3] = bbox(geojson);
	});

	fs.writeFileSync('extents.json', JSON.stringify(extents));
}

main();