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

    vis.stationMap = L.map(vis.parentElement).setView(vis.startingCoord, 3);

    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(vis.stationMap);

    L.Icon.Default.imagePath = "img/";

    vis.stationsGroup = L.layerGroup().addTo(vis.stationMap);

    // Get Endangered Species by Park
    vis.endangeredSpecies = {};

    // console.log("SPECIES DATA", vis.speciesData)
    vis.speciesData.forEach((species) => {
      if (species["Conservation Status"] == "Endangered") {
        let parkName = species["Park Name"];
        if (vis.endangeredSpecies[parkName] == undefined) {
          vis.endangeredSpecies[parkName] = [];
        }
        vis.endangeredSpecies[parkName].push(species["Scientific Name"]);
      }
    });

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

    vis.parkData.forEach((park) => {
      let parkName = park["Park Name"];
      let endangeredSpeciesHTML = "<br>";
      let speciesArr = vis.endangeredSpecies[parkName];
      if (speciesArr != undefined) {
        vis.endangeredSpecies[parkName].forEach((speciesName) => {
          endangeredSpeciesHTML += speciesName + "<br>";
        });
      } else {
        endangeredSpeciesHTML += "No Endangered Species";
      }

      let popup = L.popup().setContent(`<p>Park Name: ${parkName} ${endangeredSpeciesHTML}</p>`);
      // let popup = L.popup().setContent(`<p>Station: ${station.name} <br /> Capacity: ${station.capacity}`)
      let marker = L.marker([park.Latitude, park.Longitude]).bindPopup(popup);

      vis.stationsGroup.addLayer(marker);
    });
  }
}
