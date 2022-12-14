/* * * * * * * * * * * * * *
 *     class BarChart      *
 * * * * * * * * * * * * * */

class BarChart {
  constructor(parentElement, parkData, speciesData) {
    this.parentElement = parentElement;
    this.parkData = parkData;
    this.speciesData = speciesData;
    this.displayData = [];

    // helpers
    this.parseDate = d3.timeParse("%m/%d/%Y");
    this.formatPercentage = d3.format(".2%");

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 20, bottom: 180, left: 40 };
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
      .attr("class", "title bar-title")
      .append("text")
      .text(`Species per Park in ${selectedState}`)
      .attr("transform", `translate(${vis.width / 2}, 10)`)
      .attr("text-anchor", "middle");

    // scales and axes
    vis.x = d3.scaleBand().range([0, vis.width]).padding(0.1);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxis = d3.axisBottom().scale(vis.x);
    vis.yAxis = d3.axisLeft().scale(vis.y);

    vis.svg.append("g").attr("class", "x-axis axis").attr("transform", `translate(0, ${vis.height})`);
    vis.svg.append("g").attr("class", "y-axis axis");

    // append tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "exploreBarTooltip");

    this.wrangleData();
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

    let parksByState = Array.from(
      d3.group(vis.parkSpeciesInfo, (d) => d.state),
      ([key, value]) => ({ key, value })
    );

    let state = parksByState.find((value) => value.key === nameConverter.getAbbreviation(selectedState));
    vis.displayData = state ? state.value.sort((a, b) => b.species - a.species) : [];

    // Update the visualization
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.svg.select(".bar-title").select("text").text(`Species per Park in ${selectedState}`);
    // set scale domains
    vis.x.domain(vis.displayData.map((value) => value.name));
    vis.y.domain([0, d3.max(vis.displayData, (d) => d.species) * 1.1]);

    // draw axes
    vis.svg
      .select(".x-axis")
      .call(vis.xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function (d) {
        return "rotate(-45)";
      });
    vis.svg.select(".y-axis").call(vis.yAxis);

    // draw bars
    let bars = vis.svg.selectAll(".bars").data(vis.displayData);
    bars
      .enter()
      .append("rect")
      .on("mouseover", function (event, d) {
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px")
          .html(
            `
            <div style="border: thin solid lightgrey; border-radius: 4px; background: rgb(249, 249, 246); padding: 12px; box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;">
         ${d3.format(",")(d.species)} species
         </div>`
          );
      })
      .on("mouseout", function (event, d) {
        vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);
      })
      .merge(bars)
      .transition()
      .attr("class", "bars")
      .attr("fill", (d) => "blue")
      .attr("x", (d) => vis.x(d.name))
      .attr("y", (d) => vis.y(d.species))
      .attr("width", vis.x.bandwidth())
      .attr("height", (d) => Math.max(0, vis.height - vis.y(d.species)));

    bars.exit().remove();
  }
}
