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
 
 
                     currentPopup = new maplibregl.Popup()
                         .setLngLat(coordinates)
                         .setHTML(HTML)
                         .addTo(map);
                 }});
 