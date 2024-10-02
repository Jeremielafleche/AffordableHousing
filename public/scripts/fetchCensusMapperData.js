async function addCensusMapperData(map) {

    const censusMapperUrl = 'https://censusmapper.ca/api/v1/geo.geojson?dataset=CA21&regions={%22CSD%22:[%225915022%22,%222466112%22,%222466117%22,%222466127%22,%222466023%22,%222466102%22,%222466107%22,%222466142%22,%222466097%22,%222466087%22,%222466072%22,%222466007%22,%222466058%22,%222466032%22,%222466062%22,%222466047%22,%223506008%22,%223520005%22,%224611040%22,%224806016%22],%22CD%22:[%221203%22,%221202%22,%221201%22,%221204%22,%221205%22,%221207%22,%221206%22,%221208%22,%221209%22,%221210%22,%221212%22,%221214%22,%221213%22,%221216%22,%221217%22,%221218%22,%221215%22,%221211%22]}&level=CT&api_key=CensusMapper_a663240ee567b8e87e4ddd6270be6edc';
    const incomeDataUrl = 'public/data/Data Income List.json';

    const [geoResponse, incomeResponse] = await Promise.all([
        fetch(censusMapperUrl),
        fetch(incomeDataUrl)
    ]);

    const censusData = await geoResponse.json();
    const incomeData = JSON.parse(await incomeResponse.text());

    console.log(typeof(incomeData))
    censusData.features.map((e) => {
        const id = e.properties.id
        // search for the id in the other dataset
        let result = incomeData.filter((e) => parseFloat(e.GeoUID) === parseFloat(id))
        result[0]["householdIncome"] = parseFloat(result[0]["v_CA21_906: Median total income of household in 2020 ($)"])
        console.log(result)
        e.properties = {
            ...e.properties,
            ...result[0]
        }
        e.id = e.properties.id
        return e
    })
    console.log(censusData)


    

    // Iterate through each feature in censusData
    censusData.features.forEach(feature => {
        const id = feature.properties.GeoUID; // Assuming GeoUID is the identifier in incomeData

        // Search for the corresponding income data based on GeoUID
        let result = incomeData.find(data => data.GeoUID === id);

        if (result) {
            // Merge income data into feature properties
            feature.properties = {
                ...feature.properties,
                ...result
            };
        } else {
            console.warn(`No income data found for GeoUID ${id}`);
            // Optionally, handle or log the feature where income data is missing
            console.log(feature);
        }
    });




    // When a click event occurs on a feature in the states layer, open a popup at the
    // location of the click, with description HTML from its properties.
    map.on('click', 'states-layer', (e) => {

        const HTML = ` 
    <p><strong>Region:</strong> ${e.features[0].properties["Region Name"]}</p>
    <p><strong>Income ($):</strong> ${e.features[0].properties["v_CA21_906: Median total income of household in 2020 ($)"]}</p>
    <p><strong>Area (sq km):</strong> ${e.features[0].properties["Area (sq km)"]}</p>
    <p><strong>Dwellings:</strong> ${e.features[0].properties["Dwellings"]}</p>
    <p><strong>Households:</strong> ${e.features[0].properties["Households"]}</p>`;


        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(HTML)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'states-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });



    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'states-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    return censusData;
}
