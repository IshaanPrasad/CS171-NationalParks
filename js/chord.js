/* * * * * * * * * * * * * *
 *     class BarChart      *
 * * * * * * * * * * * * * */
/* ****************************************************************** */
/* ****************************** Chord ***************************** */
/* ****************************************************************** */
class Chord {
  constructor(parentElement, matrix) {
    this.parentElement = parentElement;
    this.matrix = matrix;
    this.displayData = [];

    // helpers
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

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    var res = d3.chord()
        .padAngle(0.05)     // padding between entities (black arc)
        .sortSubgroups(d3.descending)
        (vis.matrix)

    // Update the visualization
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis
        .datum(res)
        .append("g")
        .selectAll("g")
        .data(function(d) { return d.groups; })
        .enter()
        .append("g")
        .append("path")
        .style("fill", "grey")
        .style("stroke", "black")
        .attr("d", d3.arc()
            .innerRadius(200)
            .outerRadius(210)
        )

    vis
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(function(d) { return d; })
        .enter()
        .append("path")
        .attr("d", d3.ribbon()
            .radius(200)
        )
        .style("fill", "#69b3a2")
        .style("stroke", "black");
  }
}

// create the svg area
var svg = d3.select("#chord")
    .append("svg")
    .attr("width", 440)
    .attr("height", 440)
    .append("g")
    .attr("transform", "translate(220,220)")

// create input data: a square matrix that provides flow between entities
var matrix = [
  [483, 0, 0, 0, 255, 0, 0, 0, 0, 0],
  [0, 608, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 884, 0, 0, 0, 0, 300, 0, 0],
  [0, 0, 0, 538, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 3289, 0, 0, 0, 0, 0],
  [0, 0, 322, 0, 0, 596, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1166, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 2316, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 405, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 433]
];


/* ****************************************************************** */
/* **** TEMPORARY (DRAFT) CODE -- To sketch out visualization ******* */
/* ****************************************************************** */
// Original Inspiration / Boilerplate Code: https://d3-graph-gallery.com/graph/chord_basic.html
// Calculate Arc + Ribbon
var res = d3.chord()
    .padAngle(0.1)     // padding between entities (black arc)
    .sortSubgroups(d3.descending)
    (matrix)

// Add groups on  inner part of the circle
svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()
    .append("g")
    .append("path")
    .style("fill", "grey")
    .style("stroke", "black")
    .attr("d", d3.arc()
        .innerRadius(200)
        .outerRadius(210)
    )

// Add links between groups
svg
    .datum(res)
    .append("g")
    .selectAll("path")
    .data(function(d) { return d; })
    .enter()
    .append("path")
    .attr("d", d3.ribbon()
        .radius(200)
    )
    .style("fill", "#69b3a2")
    .style("stroke", "black");
