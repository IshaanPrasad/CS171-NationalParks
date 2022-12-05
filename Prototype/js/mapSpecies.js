/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

class MapSpecies {
  /*
   *  Constructor method
   */
  constructor(parentElement, parkData, speciesData, startingCoord) {
    this.parentElement = parentElement;
    this.parkData = parkData;
    this.speciesData = speciesData;
    this.startingCoord = startingCoord;

    this.initVis();
  }

  /*
   *  Initialize station map
   */
  initVis() {
    let vis = this;

    let SouthEast = L.latLng(-90,180),
        NorthWest = L.latLng(90,-180),
        Bounds = L.latLngBounds(SouthEast,NorthWest);

    vis.stationMap = L.map(vis.parentElement, {maxBounds: Bounds}).setView(vis.startingCoord, 3);

    // Initialize map background
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      nowrap: true,
      bounds: Bounds
    }).addTo(vis.stationMap);

    L.Icon.Default.imagePath = "img/";

    // Add map to group
    vis.stationsGroup = L.layerGroup().addTo(vis.stationMap);

    vis.wrangleData();
  }

  /*
   *  Data wrangling
   */
  wrangleData() {
    let vis = this;

    // No data wrangling/filtering needed

    // Update the visualization
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.stationsGroup.clearLayers();

    // Add markers for each of the parks
    vis.parkData.forEach((park) => {
      let parkName = park["Park Name"];
      let parkCode = park["Park Code"].toLowerCase();

      let popup = L.popup().setContent(`<p><b>${parkName}</b> <br><br> Park Description: ${descriptionDict[parkCode]} <br><br> Weather Info: ${weatherInfo[parkCode]}</p>`);
      // let popup = L.popup().setContent(`<p>Station: ${station.name} <br /> Capacity: ${station.capacity}`)
      let marker = L.marker([park.Latitude, park.Longitude]).bindPopup(popup);

      vis.stationsGroup.addLayer(marker);
    });
  }
}
