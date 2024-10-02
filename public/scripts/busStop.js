//   Function to add bus stops to map and display popup with bus stop information
//            try {
//              // Fetch the GeoJSON bus stop data from the provided URL
//              const response = await fetch(url);
//              const busStopData = await response.json();

//              // Loop through each feature (bus stop) in the GeoJSON data
//              busStopData.features.forEach(function (feature) {
//                const coordinates = feature.geometry.coordinates;
//                const properties = feature.properties;

//                // Create a new marker for the bus stop
//                const marker = new maplibregl.Marker()
//                  .setLngLat(coordinates)
//                  .addTo(map);

//                // Create a popup with bus stop information
//                const popupContent = `
//                  <strong>Route: ${properties.route_short_name} - ${properties.route_long_name}</strong><br>
//                  Category: ${properties.route_category}<br>
//                  Created: ${new Date(properties.create_dt_utc).toLocaleString()}<br>
//                  Modified: ${new Date(properties.mod_dt_utc).toLocaleString()}<br>
//                  Global ID: ${properties.globalid}
//                `;

//                // Create a popup and attach it to the marker
//                const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

//                // Show popup when the marker is clicked
//                marker.setPopup(popup);
//              });
//            } catch (error) {
//              console.error("Error fetching or processing bus stop data:", error);
//            }
//          ;