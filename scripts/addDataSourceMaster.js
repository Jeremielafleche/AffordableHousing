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
                const {
                    coordinates,
                    type
                } = geometry;
                return {
                    type: "Feature",
                    geometry: {
                        type,
                        coordinates
                    },
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
            id: `${sourceId}-unclustered-point`,
            type: "symbol",
            source: sourceId,
            filter: ["!", ["has", "point_count"]],
            layout: {
                "icon-image": "house-icon",
                "icon-size": 0.06 // Adjusted the icon size
            }
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
                    "#BED2E6",
                    100,
                    "#8AA3BB",
                    750,
                    "#607D9B"
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    100,
                    30,
                    750,
                    40
                ],
                "circle-stroke-color": "white",
                "circle-stroke-width": 2
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


        map.on("click", `${sourceId}-clusters`, async (e) => {

            const features = map.queryRenderedFeatures(e.point, {
                layers: [`${sourceId}-clusters`]
            });
            const clusterId = features[0].properties.cluster_id;
            const zoom = await map.getSource(sourceId).getClusterExpansionZoom(clusterId);
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom
            });
        });



        let currentPopup = null;
        map.on("click", `${sourceId}-unclustered-point`, (e) => {


            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;

            async function addDatatoSource(url, sourceId) {
                console.log("this is logged number 2 ")


                let jsonData;

                const DATA_URL = "data/NHS_DATA.json"; // URL constant

                async function loadNHSData() {
                    try {
                        const response = await fetch(DATA_URL);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        jsonData = await response.json(); // Assign the fetched data to jsonData

                        await addDataToSource(jsonData, "NHS DATA");
                        console.log("NHS data imported successfully:", jsonData);

                        // Call initializeMap after jsonData is successfully loaded
                        initializeMap();
                    } catch (error) {
                        console.error("Error importing NHS data:", error);
                    }
                }

                function initializeMap() {
                    if (jsonData) {
                        console.log("Initializing map with jsonData", jsonData);
                        // Convert to GeoJSON and perform further map setup here
                        const geoJSONData = convertToGeoJSON(jsonData);

                        // Example of adding GeoJSON data to the map
                        map.addSource("nhs-data-source", {
                            type: "geojson",
                            data: geoJSONData,
                            cluster: true,
                            clusterMaxZoom: 14,
                            clusterRadius: 50,
                        });

                        // Your layer setup code goes here...
                    } else {
                        console.error("jsonData is not available.");
                    }
                }

                function convertToGeoJSON(data) {
                    return {
                        type: "FeatureCollection",
                        features: data.map(item => ({
                            type: "Feature",
                            properties: {
                                dateAnnounced: item["Date Announced"],
                                program: item["Program"],
                                projectName: item["Project Name"],
                                location: item["Location"],
                                projectType: item["Project Type"],
                                proponentOrganization: item["Proponent Organization"],
                                proponentType: item["Proponent Type"],
                                federalContribution: Number(item["Federal Contribution (in dollars)"]),
                                totalContribution: Number(item["Total Contribution Amount"]),
                                totalLoanAmount: Number(item["Total Loan Amount"]),
                                numberOfUnits: Number(item["Number of Units"]),
                                numberOfAffordableUnits: Number(item["Number of Affordable Units"]),
                                numberOfAccessibleUnits: Number(item["Number of Accessible Units"]),
                                constructionStatus: item["Construction Status"]
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    parseFloat(item["Longitude"]),
                                    parseFloat(item["Latitude"])
                                ]
                            }
                        }))
                    };
                }

                // Start loading the data
                loadNHSData();



                // Generate popup HTML based on sourceId
                if (sourceId === 'toronto') {
                    HTML = `
                            <p><strong>Address(es):</strong> ${properties.Addresses}</p>
                            <p><strong>Building Status:</strong> ${properties.Status}</p>
                            <p><strong>Ward:</strong> ${properties.Ward}</p>`;
                } else if (sourceId === 'vancouver') {
                    HTML = `
                            <p><strong>Name:</strong> ${properties.name ? properties.name : "No Name"}</p>
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
                } else if (sourceId === 'manitoba') {
                    const parsedProperties = JSON.parse(properties.properties);
                    HTML = `
                            <p><strong>Address(es):</strong> ${parsedProperties.formatted}</p>
                            <p><strong>Building Type:</strong> ${parsedProperties.original_Type}</p>`;
                } else if (sourceId === 'ottawa') {
                    const parsedProperties = JSON.parse(properties.properties);
                    HTML = `
                            <p><strong>Address(es):</strong> ${parsedProperties.Address}</p>
                            <p><strong>Community:</strong> ${parsedProperties.Community}</p>
                            <p><strong>Description:</strong> ${parsedProperties.Description}</p>
                            <p><strong>Washer available:</strong> ${parsedProperties["Washer available"]}</p>
                            <p><strong>Dryer Available:</strong> ${parsedProperties["Dryer Available"]}</p>
                            <p><strong>Elevator:</strong> ${parsedProperties.Elevator}</p>
                            <p><strong>Seniors only:</strong> ${parsedProperties["Seniors only"]}</p>
                            <p><strong>Image:</strong> <img src="${parsedProperties.Image}" alt="Image of the property" width="200" height="200"></p>`;
                } else if (sourceId === 'calgary') {
                    const parsedProperties = JSON.parse(properties.properties);
                    HTML = `
                            <p><strong>Address(es):</strong> ${parsedProperties.formatted}</p>
                            <p><strong>Building Type:</strong> ${parsedProperties.original_Type}</p>`;

                }
