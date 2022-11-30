/* * * * * * * * * * * * * *
 *     class BarChart      *
 * * * * * * * * * * * * * */

class EndangeredInfoChart {
  constructor(parentElement, parkData, speciesData, visitorData) {
    this.parentElement = parentElement;
    this.parkData = parkData;
    this.speciesData = speciesData;
    this.visitorData = visitorData;
    this.displayData = [];
    this.selectedSpecies = "";

    // helpers
    this.parseDate = d3.timeParse("%m/%d/%Y");
    this.formatPercentage = d3.format(".2%");

    this.initVis();
  }

  initVis() {
    let vis = this;

    // append tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "conservationTooltip");

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    let conservationFilter = ["Endangered", "In Recovery", "Species of Concern", "Threatened"];

    let filteredSpeciesData = vis.speciesData.filter(
      (value) =>
        conservationFilter.includes(value["Conservation Status"]) && value["Park Name"] == selectedEndangeredPark
    );
    console.log(filteredSpeciesData);

    vis.parkSpeciesInfo = Array.from(
      d3.group(filteredSpeciesData, (d) => d["Conservation Status"]),
      ([key, value]) => ({ key, value })
    );

    console.log(vis.parkSpeciesInfo);

    vis.displayData = vis.parkSpeciesInfo.map((element) => ({
      name: element.key,
      species: element.value.length,
    }));

    // have a look

    vis.displayData = vis.displayData.sort((a, b) => b.species - a.species);

    vis.listData = vis.parkSpeciesInfo.find((v) => v.key === selectedEndangered)
      ? vis.parkSpeciesInfo.find((v) => v.key === selectedEndangered).value
      : [];

    console.log(vis.listData);

    // Update the visualization
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    d3.select("#endangered-info-title").text("Conservation Status in " + selectedEndangeredPark);

    d3.select("#concern-value").text(vis.displayData.find((v) => v.name == "Species of Concern")?.species || 0);

    d3.select("#threatened-value").text(vis.displayData.find((v) => v.name == "Threatened")?.species || 0);

    d3.select("#endangered-value").text(vis.displayData.find((v) => v.name == "Endangered")?.species || 0);

    d3.select("#recovery-value").text(vis.displayData.find((v) => v.name == "In Recovery")?.species || 0);

    let list = d3.select("#conservation-list").selectAll("li").data(vis.listData);
    list
      .enter()
      .append("li")
      .attr("class", "list-group-item")
      .merge(list)
      .text((v) => v["Common Names"].split(",")[0])
      .on("click", function (e, d) {
        d3.select("#conservation-list").selectAll("li").attr("class", "list-group-item");
        d3.select(this).attr("class", "list-group-item active");
      })
      .on("mouseover", function (e, d) {
        vis.tooltip
          .style("opacity", 1)
          .style("left", e.pageX + 20 + "px")
          .style("top", e.pageY - 200 + "px")
          .html(
            `
         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
         <h3>${d["Common Names"].split(",")[0]}</h3>
         <h4>Category: ${d["Category"]}</h4>
         <h4>Scientific Name: ${d["Scientific Name"]}</h4>
         <img src="species-images/${d["Scientific Name"]}.jpg" style="  display: block;
         max-width:400px;
         max-height:200px;
         width: auto;
         height: auto;">
         </div>`
          );
      })
      .on("mouseout", function (e, d) {
        vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);
      });
    list.exit().remove();

    d3.select("#conservation-species-info");
  }
}
