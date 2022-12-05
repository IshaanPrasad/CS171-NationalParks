/* * * * * * * * * * * * * *
 *     class BumpChar      *
 * * * * * * * * * * * * * */

class BumpChart {
  constructor(parentElement, rankingData) {
    this.parentElement = parentElement;
    this.data = rankingData;
    this.rankingData = [];
    this.displayData = [];
    this.circleData = [];

    // helpers
    this.parseDate = d3.timeParse("%m/%d/%Y");
    this.formatPercentage = d3.format(".2%");

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 60, right: 220, bottom: 20, left: 40 };
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
      .text("Most Popular Parks")
      .attr("transform", `translate(${vis.width / 2}, -30)`)
      .attr("text-anchor", "middle");

    let padding = 20;

    // scales and axes
    vis.x = d3.scalePoint().range([padding, vis.width - padding]);
    vis.y = d3.scalePoint().range([0, vis.height - padding]);

    vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    vis.xAxis = d3.axisBottom().scale(vis.x);
    vis.yAxis = d3.axisLeft().scale(vis.y);

    vis.svg.append("g").attr("class", "x-axis axis").attr("transform", `translate(0, ${vis.height})`);
    vis.svg.append("g").attr("class", "y-axis axis");

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    let rankings = {};

    let dataByYear = Array.from(d3.group(vis.data, (d) => d.Year));
    dataByYear.sort((a, b) => +a[0] - +b[0]);
    // Take last 20 years
    dataByYear = dataByYear.filter((v) => +v[0] < 2022 && +v[0] > 2001);
    // dataByYear = dataByYear.slice(-20);
    // console.log(dataByYear);
    dataByYear.forEach((_, index) => {
      dataByYear[index][1].sort((a, b) => Number(b.Total.split(",").join("")) - Number(a.Total.split(",").join("")));

      dataByYear[index][1].forEach((value, idx) => {
        if (!(value["Park Name"] in rankings)) {
          rankings[value["Park Name"]] = [];
        }
        rankings[value["Park Name"]].push({
          park: value["Park Name"],
          year: +value.Year,
          rank: idx + 1,
          visitors: Number(value.Total.split(",").join("")),
        });
      });
    });

    vis.rankingData = [];
    vis.circleData = [];

    Object.entries(rankings).forEach((value) => {
      vis.rankingData.push({ park: value[0], rankings: value[1] });
      value[1].forEach((v, i) => {
        if (i > 0 && i < value[1].length - 1) {
          if (v.rank === value[1][i - 1].rank && v.rank === value[1][i + 1].rank) {
            return;
          }
        }
        vis.circleData.push({ park: value[0], rank: v.rank, year: v.year, visitors: v.visitors });
      });
    });

    // vis.rankingData = [{ name: "Yosemite", rankings: [0, 1, 0, 2, 1] }];
    // vis.circleData = [
    //   { name: "Yosemite", ranking: 0, year: 0 },
    //   { name: "Yosemite", ranking: 1, year: 1 },
    //   { name: "Yosemite", ranking: 0, year: 2 },
    //   { name: "Yosemite", ranking: 2, year: 3 },
    //   { name: "Yosemite", ranking: 1, year: 4 },
    // ];

    // Update the visualization
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // set scale domains
    vis.x.domain(
      d3.range(
        d3.min(vis.circleData, (d) => d.year),
        d3.max(vis.circleData, (d) => d.year) + 1
      )
    );
    vis.y.domain(
      d3.range(
        d3.min(vis.circleData, (d) => d.rank),
        d3.max(vis.circleData, (d) => d.rank) + 1
      )
    );

    vis.colorScale.domain(
      vis.circleData.map((value) => value.park).filter((value, index, array) => array.indexOf(value) === index)
    );

    function highlight(e, dat) {
      vis.svg.selectAll("circle").attr("fill", (d) => {
        if (dat.park === d.park) return vis.colorScale(d.park);
        else return "lightgrey";
      });
      vis.svg.selectAll("line").attr("stroke", (d) => {
        if (dat.park === d.park) return vis.colorScale(d.park);
        else return "lightgrey";
      });
    }
    function unhighlight(e, dat) {
      vis.svg.selectAll("circle").attr("fill", (d) => vis.colorScale(d.park));
      vis.svg.selectAll("line").attr("stroke", (d) => vis.colorScale(d.park));
    }

    let circles = vis.svg.selectAll("circle").data(vis.circleData);
    circles
      .enter()
      .append("circle")
      .merge(circles)
      .attr("r", 10)
      .attr("cx", (d) => vis.x(d.year))
      .attr("cy", (d) => vis.y(d.rank))
      .attr("fill", (d) => vis.colorScale(d.park))
      .on("mouseover", highlight)
      .on("mouseout", unhighlight);
    circles.exit().remove();

    vis.rankingData.forEach((value) => {
      let lines = vis.svg.selectAll(`lines_${value.name}`).data(value.rankings.slice(0, -1));

      lines
        .enter()
        .append("line")
        .merge(lines)
        .attr("stroke", (d) => vis.colorScale(d.park))
        .attr("stroke-width", "4px")
        .attr("x1", (d, i) => vis.x(d.year))
        .attr("y1", (d, i) => vis.y(value.rankings[i].rank))
        .attr("x2", (d, i) => vis.x(d.year + 1))
        .attr("y2", (d, i) => vis.y(value.rankings[i + 1].rank))
        .on("mouseover", highlight)
        .on("mouseout", unhighlight);
      lines.exit().remove();
    });

    let labels = vis.svg.selectAll(".label").data(vis.rankingData);
    labels
      .enter()
      .append("text")
      .merge(labels)
      .attr("class", "label")
      .attr("alignment-baseline", "middle")
      .attr("x", vis.width)
      .attr("y", (d) => vis.y(d.rankings[d.rankings.length - 1].rank))
      .text((d) => "- " + d.park.replace(" National Park", ""));
    labels.exit().remove();

    // draw axes
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
  }
}
