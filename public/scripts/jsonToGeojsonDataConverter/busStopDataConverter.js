import * as data from "./data.json"

const fs = require('fs');



  
  function convertToGeoJSON(data) {
    return {
      type: 'FeatureCollection',
      features: data.map(item => ({
        type: 'Feature',
        properties: {
          
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(item['Longitude']),
            parseFloat(item['Latitude']),
          ],
        },
      })),
    };
  }
  
  const nhsGeojson = (convertToGeoJSON(data));
  
  

  
  fs.writeFileSync('data/geojson/busStops.geojson', JSON.stringify(nhsGeojson));
  