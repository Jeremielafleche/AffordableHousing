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
