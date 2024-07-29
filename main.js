const map = new maplibregl.Map({
  container: "map",
  style: "https://api.maptiler.com/maps/ch-swisstopo-lbm-dark/style.json?key=yyLFvKmMAkOmBAVbj4mk",
  center: [-79.3832, 43.6532],
  zoom: 3,
});

map.on("load", async () => {
  try {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // This is important if the image is hosted on a different domain
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
      });
    };

    const houseIcon = await loadImage("home.png");

    const canvas = document.createElement("canvas");
    canvas.width = houseIcon.width;
    canvas.height = houseIcon.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(houseIcon, 0, 0, houseIcon.width, houseIcon.height);

    // Change the color to light blue
    const imageData = ctx.getImageData(0, 0, houseIcon.width, houseIcon.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Assuming the original icon is black (0, 0, 0)
      if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
        data[i] = 173; // Red component for light blue
        data[i + 1] = 216; // Green component for light blue
        data[i + 2] = 230; // Blue component for light blue
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const houseIconData = ctx.getImageData(0, 0, houseIcon.width, houseIcon.height);
    map.addImage("house-icon", houseIconData);

    console.log("House icon loaded, colored, and added successfully");
  } catch (error) {
    console.error("Error loading house icon:", error);
  }

  async function addDatatoSource(url, sourceId) {
    try {
      let records;
      const db = await fetch(url);
      if (!db.ok) throw new Error("Network response was not ok");

      const json = await db.json();
      if (sourceId === 'vancouver') {
        records = [];
        for (let i = 0; i < 10; i++) {
          let url2 = `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/non-market-housing/records?order_by=index_number&limit=100&offset=${(100 * i)}`;
          const db2 = await fetch(url2);
          if (!db2.ok) throw new Error("Network response was not ok");

          const json2 = await db2.json();
          console.log(json2);
          records = records.concat(json2.result?.records || json2.results || json2.features || []);
        }
      } else {
        records = json.result?.records || json.results || json.features || [];
      }
      console.log(records);
      const features = records.map((properties) => {
        try {
          let geometry = properties.geometry || properties.geom?.geometry;
          if (!geometry?.type) {
            if (typeof properties.geometry === "string") {
              geometry = JSON.parse(properties.geometry);
            } else {
              console.warn("Invalid geometry:", properties.geometry);
              return null;
            }
          }
          const { coordinates, type } = geometry;
          return {
            type: "Feature",
            geometry: { type, coordinates },
            properties,
          };
        } catch (error) {
          console.error("Error parsing geometry:", error);
          return null;
        }
      }).filter(feature => feature !== null);

      const geojson = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        }
      };

      map.addSource(sourceId, {
        type: "geojson",
        data: geojson.data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: `${sourceId}-clusters`,
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1"
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map.addLayer({
        id: `${sourceId}-cluster-count`,
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        }
      });

      map.addLayer({
        id: `${sourceId}-unclustered-point`,
        type: "symbol",
        source: sourceId,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "house-icon",
          "icon-size": 0.06 // Adjusted the icon size
        }
      });

      map.on("click", `${sourceId}-clusters`, async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [`${sourceId}-clusters`] });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await map.getSource(sourceId).getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom
        });
      });

      map.on("click", `${sourceId}-unclustered-point`, (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;
        let HTML = '';

        if (sourceId === 'toronto') {
          HTML = `
            <p><strong>Address(es):</strong> ${properties.Addresses}</p>
            <p><strong>Building Status:</strong> ${properties.Status}</p>
            <p><strong>Ward:</strong> ${properties.Ward}</p>`;
        } else if (sourceId === 'vancouver') {
          HTML = `
            <p><strong>Name:</strong> ${properties.name}</p>
            <p><strong>Address(es):</strong> ${properties.address}</p>
            <p><strong>Building Operator:</strong> ${properties.operator}</p>
            <p><strong>Project Status:</strong> ${properties.project_status}</p>
            <p><strong>Occupancy Year:</strong> ${properties.occupancy_year}</p>`;
        } else if (sourceId === 'montreal') {
          const parsedProperties = JSON.parse(properties.properties);
          HTML = `
            <p><strong>Name:</strong> ${parsedProperties.nomprojet}</p>
            <p><strong>Program Start Date:</strong> ${parsedProperties.an_program}</p>
            <p><strong>Street Name:</strong> ${parsedProperties.nomrue}</p>`;
        } else if (sourceId === 'novascotia') {
          const parsedProperties = JSON.parse(properties.properties);
          HTML = `
            <p><strong>Name:</strong> ${parsedProperties.name}</p>
            <p><strong>Address(es):</strong> ${parsedProperties.address}</p>
            <p><strong>City:</strong> ${parsedProperties.city}</p>
            <p><strong>Residential Units:</strong> ${parsedProperties.residential_units}</p>
            <p><strong>Housing Authority:</strong> ${parsedProperties.housing_authority}</p>`;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(HTML)
          .addTo(map);
      });

      map.on("mouseenter", `${sourceId}-clusters`, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", `${sourceId}-clusters`, () => {
        map.getCanvas().style.cursor = "";
      });

      return json;
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  await addDatatoSource("https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=22c57a77-de52-4206-b6a7-276fb1f7ae17&limit=236", "toronto");
  await addDatatoSource("https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/non-market-housing/records?limit=100", "vancouver");
  await addDatatoSource("https://donnees.montreal.ca/dataset/d26fad0f-2eae-44d5-88a0-2bc699fd2592/resource/1c02ead8-f680-495f-9675-6dd18bd3cad0/download/logsoc_donneesouvertes_20231231.geojson", "montreal");
  await addDatatoSource("https://data.novascotia.ca/api/geospatial/2d4m-9e6x?method=export&format=GeoJSON", "novascotia");
});
