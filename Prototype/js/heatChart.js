/* * * * * * * * * * * * * *
 *     class HeatChart      *
 * * * * * * * * * * * * * */

class HeatChart {
  constructor(parentElement, rankingData) {
    this.parentElement = parentElement;
    this.data = rankingData;
    this.displayData = [];

    // helpers
    this.parseDate = d3.timeParse("%m/%d/%Y");
    this.formatPercentage = d3.format(".2%");

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 100, right: 20, bottom: 20, left: 200 };
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
    vis.title = vis.svg
      .append("g")
      .attr("class", "title bar-title")
      .append("text")
      .text(`Visitation at the most popular parks in ${selectedHeatYear}`)
      .attr("transform", `translate(${vis.width / 4}, -60)`)
      .attr("text-anchor", "middle");

    let padding = 20;

    // scales and axes
    vis.x = d3
      .scaleBand()
      .range([padding, vis.width - padding])
      .domain([
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ])
      .padding(0.1);
    vis.y = d3
      .scaleBand()
      .range([padding, vis.height - padding])
      .padding(0.2);

    vis.heatScale = d3.scaleLinear().range(["white", "#D9534F"]);

    vis.xAxis = d3.axisTop().scale(vis.x);
    vis.yAxis = d3.axisLeft().scale(vis.y);

    vis.svg.append("g").attr("class", "x-axis axis"); //.attr("transform", `translate(0, ${vis.height})`);
    vis.svg.append("g").attr("class", "y-axis axis");

    // append tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "heatTooltip");

    // append legend
    vis.legend = vis.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${vis.width / 2}, -60)`);

    vis.legendScale = d3.scaleLinear().range([0, 200]);

    vis.xAxisLegend = d3.axisBottom().scale(vis.legendScale).ticks(2);

    vis.legend.append("g").attr("class", "x-axis-legend axis");

    // Create gradient for legend
    let gradient = vis.svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "svgHeatGradient")
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
      .attr("stop-color", "#D9534F")
      .attr("stop-opacity", 1);

    vis.legend
      .append("rect")
      .attr("x", 0)
      .attr("y", -20)
      .attr("width", 200)
      .attr("height", 20)
      .attr("fill", "url(#svgHeatGradient)");

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.displayData = [];
    let dataYear = vis.data.filter((value) => value.Year === selectedHeatYear);
    dataYear.sort((a, b) => +b.Total.split(",").join("") - +a.Total.split(",").join(""));
    // console.log(dataYear);
    dataYear.forEach((value) => {
      this.displayData.push({ park: value["Park Name"], month: "January", visitors: +value.JAN.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "February", visitors: +value.FEB.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "March", visitors: +value.MAR.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "April", visitors: +value.APR.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "May", visitors: +value.MAY.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "June", visitors: +value.JUN.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "July", visitors: +value.JUL.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "August", visitors: +value.AUG.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "September", visitors: +value.SEP.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "October", visitors: +value.OCT.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "November", visitors: +value.NOV.split(",").join("") });
      this.displayData.push({ park: value["Park Name"], month: "December", visitors: +value.DEC.split(",").join("") });
    });

    // Update the visualization
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.title.text(`Visitation at the most popular parks in ${selectedHeatYear}`);

    // set scale domains
    vis.y.domain(
      vis.displayData.map((value) => value.park).filter((value, index, array) => array.indexOf(value) === index)
    );
    vis.heatScale.domain([d3.min(vis.displayData, (d) => d.visitors), d3.max(vis.displayData, (d) => d.visitors)]);

    vis.legendScale.domain(vis.heatScale.domain());

    vis.xAxisLegend.tickValues(vis.legendScale.domain());
    vis.xAxisLegend.tickFormat(d3.format(","));

    // draw legend axis
    vis.legend.select(".x-axis-legend").call(vis.xAxisLegend);

    let rects = vis.svg.selectAll(".heat-rect").data(vis.displayData);
    rects
      .enter()
      .append("rect")
      .attr("class", "heat-rect")
      .merge(rects)
      .attr("width", vis.x.bandwidth())
      .attr("height", vis.y.bandwidth())
      .attr("x", (d) => vis.x(d.month))
      .attr("y", (d) => vis.y(d.park))
      .attr("fill", (d) => vis.heatScale(d.visitors))
      .on("mouseover", function (event, d) {
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px")
          .html(
            `
            <div style="border: thin solid lightgrey; border-radius: 4px; background: rgb(249, 249, 246); padding: 12px; box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;">
         ${d3.format(",")(d.visitors)} visitors
         </div>`
          );
        d3.select(this)
          .attr("stroke-width", "4px")
          .attr("stroke", (d) => vis.heatScale(d.visitors));
      })
      .on("mouseout", function (event, d) {
        vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);
        d3.select(this).attr("stroke-width", "0px");
      });
    rects.exit().remove();

    // draw axes
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
  }
}
