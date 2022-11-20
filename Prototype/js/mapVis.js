/* * * * * * * * * * * * * *
 *          MapVis          *
 * * * * * * * * * * * * * */

class MapVis {
  constructor(parentElement, geoData, parkData, speciesData) {
    this.parentElement = parentElement;
    this.geoData = geoData;
    this.parkData = parkData;
    this.speciesData = speciesData;
    this.displayData = [];

    // parse date method
    this.parseDate = d3.timeParse("%m/%d/%Y");
    this.formatPercentage = d3.format(".2%");

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 20, bottom: 20, left: 40 };
    vis.width =
      document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
    vis.height =
      document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

    // add title
    vis.svg
      .append("g")
      .attr("class", "title")
      .attr("id", "map-title")
      .append("text")
      .text("Choropleth of number of species per state")
      .attr("transform", `translate(${vis.width / 2}, 20)`)
      .attr("text-anchor", "middle");

    // draw map
    vis.path = d3.geoPath();
    vis.states = topojson.feature(vis.geoData, vis.geoData.objects.states).features;

    vis.viewpoint = { width: 975, height: 610 };
    vis.zoom = vis.width / vis.viewpoint.width;

    // adjust map position
    vis.map = vis.svg
      .append("g") // group will contain all state paths
      .attr("class", "states")
      .attr("transform", `scale(${vis.zoom} ${vis.zoom})`);

    // draw map
    vis.states = vis.map
      .selectAll(".state")
      .data(vis.states)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", vis.path)
      .on("mouseover", function (event, d) {
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px")
          .html(
            `
         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
             <h3>${d.properties.name}<h3>
             <h4>Total species: ${vis.stateInfo[nameConverter.getAbbreviation(d.properties.name)]?.species}<h3>
             <h4>Number of parks: ${vis.stateInfo[nameConverter.getAbbreviation(d.properties.name)]?.parks}<h3>
             <h4>Total acres: ${vis.stateInfo[nameConverter.getAbbreviation(d.properties.name)]?.acres}<h3>
         </div>`
          );

        // update selected state on hover and trigger updates for other charts (linked hover)
        selectedState = d.properties.name;
        mapVis.updateVis();
        barChart.wrangleData();
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("stroke-width", "1px")
          .attr("fill", (d) => {
            if (vis.stateInfo[d.properties.name]) {
              return vis.x(vis.stateInfo[d.properties.name][selectedCategory]);
            } else {
              return "white";
            }
          });
        vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);

        // update selected state on hover out and trigger updates for other charts
        selectedState = "";
        mapVis.updateVis();
        barChart.wrangleData();
      });

    // append tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "mapTooltip");

    // append legend
    vis.legend = vis.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${vis.width / 2}, ${vis.height - 20})`);

    // scales and axes
    vis.x = d3.scaleLinear().range(["white", "#136D70"]);
    vis.legendScale = d3.scaleLinear().range([0, 200]);

    vis.xAxis = d3.axisBottom().scale(vis.legendScale).ticks(2);

    vis.legend.append("g").attr("class", "x-axis axis");

    // Create gradient for legend
    let gradient = vis.svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "svgGradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient
      .append("stop")
      .attr("class", "start")
      .attr("offset", "0%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("class", "end")
      .attr("offset", "100%")
      .attr("stop-color", "#136D70")
      .attr("stop-opacity", 1);

    vis.legend
      .append("rect")
      .attr("x", 0)
      .attr("y", -20)
      .attr("width", 200)
      .attr("height", 20)
      .attr("fill", "url(#svgGradient)");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.parkSpeciesInfo = Array.from(
      d3.group(vis.speciesData, (d) => d["Park Name"]),
      ([key, value]) => ({ key, value })
    );

    vis.parkSpeciesInfo = vis.parkSpeciesInfo.map((element) => ({
      name: element.key,
      species: element.value.length,
      state: vis.parkData.find((e) => e["Park Name"] === element.key)["State"],
    }));

    // have a look

    // init final data structure in which both data sets will be merged into
    vis.stateInfo = {};

    let parksByState = Array.from(
      d3.group(vis.parkData, (d) => d["State"]),
      ([key, value]) => ({ key, value })
    );

    // merge
    parksByState.forEach((state) => {
      // populate the final data structure
      vis.stateInfo[state.key] = {
        state: state.key,
        parks: state.value.length,
        acres: state.value.reduce((previousValue, currentValue) => previousValue + Number(currentValue["Acres"]), 0),
        species: vis.parkSpeciesInfo
          .filter((value) => value.state === state.key)
          .reduce((previousValue, currentValue) => previousValue + currentValue.species, 0),
      };
    });

    // console.log("final data structure for myDataTable", vis.stateInfo);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // update scale domains
    vis.x.domain([
      d3.min(Object.values(vis.stateInfo), (v) => v.species),
      d3.max(Object.values(vis.stateInfo), (v) => v.species),
    ]);
    vis.legendScale.domain(vis.x.domain());

    // change tick value formatting depending on selected category
    vis.xAxis.tickValues(vis.legendScale.domain());
    vis.xAxis.tickFormat(d3.format(","));

    // draw axis
    vis.legend.select(".x-axis").call(vis.xAxis);

    // update state fill color based on data on whether state is selected
    vis.states
      .attr("stroke", "grey")
      .attr("class", (d) => {
        if (d.properties.name === selectedState) {
          return "state hovered";
        }
        return "state";
      })
      .attr("fill", (d) => {
        let abbrev = nameConverter.getAbbreviation(d.properties.name);
        if (vis.stateInfo[abbrev]) {
          return vis.x(vis.stateInfo[abbrev].species);
        } else {
          return "white";
        }
      });
  }
}
