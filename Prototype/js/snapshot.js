/* * * * * * * * * * * * * *
 *     class Snapshot      *
 * * * * * * * * * * * * * */

class SnapshotVis {
  constructor(parentElement, visitationData) {
    this.parentElement = parentElement;
    this.data = visitationData;
    this.cols = [];

    this.initVis();
  }

  initVis() {
    let vis = this;

    // init drawing area
    vis.container = d3
      .select("#" + vis.parentElement)
      .append("div")
      .attr("class", "row");

    vis.parks = [
      "Great Smoky Mountains",
      "Zion",
      "Yellowstone",
      "Grand Canyon",
      "Rocky Mountain",
      "Acadia",
      "Grand Teton",
      "Yosemite",
      "Glacier",
      "Olympic",
    ];

    vis.parks.forEach((v) => {
      let col = vis.container.append("div").attr("class", "col");
      col
        .append("img")
        .attr("style", "width:220px; height: 123.75px; margin-top: 16px;")
        .attr("src", `park-images/${v}.jpg.webp`);
      col.append("div").text(v);

      vis.cols.push(col);
    });

    // append tooltip
    vis.tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("id", "snapshotTooltip");

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.data = vis.data.filter((value) => value.Year === "2021");

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.cols.forEach((v, i) => {
      v.on("mouseover", function (event, d) {
        console.log(vis.data);
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px")
          .html(
            `
            <div style="border: thin solid lightgrey; border-radius: 4px; background: rgb(249, 249, 246); padding: 12px; box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;">
         ${vis.data.find((d) => d["Park Name"] === vis.parks[i] + " National Park").Total} visitors
         </div>`
          );
      }).on("mouseout", function (event, d) {
        vis.tooltip.style("opacity", 0).style("left", 0).style("top", 0).html(``);
      });
    });
  }
}
