import config from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import Graphic from "@arcgis/core/Graphic";
import MapView from "@arcgis/core/views/MapView";
import Locate from "@arcgis/core/widgets/Locate";
import Search from "@arcgis/core/widgets/Search";
// import locator from "@arcgis/core/rest/locator";
import { addressToLocations } from "@arcgis/core/rest/locator";

config.apiKey =
    "AAPKcf3f286477cf4957af1dd23c22270fceg4BEunenRt85EgxxIscnvtmOB6wxnBTRZVSWvW9t_Bxde8ZrWC3CgSKaiC8Gvh9v";

// Create the map and set the map type.
const map = new Map({
    basemap: "arcgis-navigation",
});

// Create the view
const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-40, 28],
    zoom: 2,
});

// Use the Locate widget to locate the user's location
const locate = new Locate({
    view: view,
    useHeadingEnabled: false, // Prevents the default rotation of the map

    // Create custom zoom to a scale of 1500
    goToOverride: function (view, options) {
        options.target.scale = 1500;
        return view.goTo(options.target);
    },
});

// Add the search widget
const search = new Search({
    view: view,
});

// --------------------------locator rest module-------------------------------
// Array to store the options to use as locators
const places = [
    "Choose a place type...",
    "Parks and Outdoors",
    "Coffee Shop",
    "Gas Station",
    "Food",
    "Hotel",
];

// Create a select html element for the search categories
const select = document.createElement("select", "");
select.setAttribute("class", "esri-widget esri-select");

// Create an option html element for each category and add it to the select element
places.forEach((p) => {
    const option = document.createElement("option");
    option.value = p;
    option.innerHTML = p;
    select.appendChild(option);
});

// Define the locatorUrl to use the Geocoding Service provided by arcGIS
const locatorUrl =
    "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

// Find places and them to the map
function findPlaces(category, pt) {
    addressToLocations(locatorUrl, {
        location: pt,
        categories: [category],
        maxLocations: 25,
        outFields: ["Place_addr", "PlaceName"],
    })
        // Clear the view of existing popups and graphics
        .then((results) => {
            view.popup.close();
            view.graphics.removeAll();

            // Create a graphic for each result returned
            results.forEach((result) => {
                view.graphics.add(
                    new Graphic({
                        attributes: result.attributes, // Data attributes returned
                        geometry: result.location, // Point returned
                        symbol: {
                            type: "simple-marker",
                            color: "#000000",
                            size: "12px",
                            outline: {
                                color: "#ffffff",
                                width: "2px",
                            },
                        },

                        // Set the popup template
                        popupTemplate: {
                            title: "{PlaceName}", // Data attribute names
                            content: "{Place_addr}",
                        },
                    })
                );
            });
        });
}
// ----------------------------------------------------------------------------

// Add widgets to the view
view.ui.add(locate, "top-left");
view.ui.add(search, "top-right");
view.ui.add(select, "top-right");

// Call findPlaces when the view loads, and each time the view changes or becomes stationary
view.watch("stationary", (val) => {
    if (val) {
        findPlaces(select.value, view.center);
    }
});

// Listen for category changes and find places based on new category
select.addEventListener("change", (event) => {
    findPlaces(event.target.value, view.center);
});
