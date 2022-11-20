
class SpiderChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // console.log(this.data)

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        // Used for converting to percentages
        this.formatPercentage = d3.format(".2%");

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.features = ["Species_ID_nunique","Species_ID_Endangered","Species_ID_Native","Species_ID_Rare","Acres"];
        vis.feature_names = ["# Species", "Endangered Species", "Nativeness", "Rare Species", "Size"]

        vis.margin = { top: 20, right: 100, bottom: 40, left: 100 };
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
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        let radialScale = d3.scaleLinear()
            .domain([0,10])
            .range([0,250]);

        let ticks = [2,4,6,8,10];

        vis.svg.append("g")
            .selectAll("circle")
            .data(ticks)
            .enter()
            .append("circle")
            .attr("cx", 300)
            .attr("cy", 300)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => radialScale(d));

        function angleToCoordinate(angle, value, scale){
            let x = Math.cos(angle) * scale(value);
            let y = Math.sin(angle) * scale(value);
            return {"x": 300 + x, "y": 300 - y};
        }

        vis.spiderGroup = vis.svg.append("g")

        for (let i = 0; i < vis.features.length; i++) {
            let ft_name = vis.feature_names[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            let line_coordinate = angleToCoordinate(angle, 10, radialScale);
            let label_coordinate = angleToCoordinate(angle, 10.5, radialScale);

            //draw axis line
            vis.spiderGroup.append("line")
                .attr("x1", 300)
                .attr("y1", 300)
                .attr("x2", line_coordinate.x)
                .attr("y2", line_coordinate.y)
                .attr("stroke","black");

            if (i == 1) {
                label_coordinate.x = label_coordinate.x - 140
            } else if (i == 2) {
                label_coordinate.x = label_coordinate.x - 100
            }

            //draw axis label
            vis.spiderGroup.append("text")
                .attr("x", label_coordinate.x)
                .attr("y", label_coordinate.y)
                .text(ft_name);
        }


        // Adding legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + 640 + "," + 100 + ")");

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this

        vis.displayData = vis.data.filter(d => document.getElementById(d["Park Code"]).checked);

        // console.log("DSIPLAY DATA")
        // console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this

        let radialScale = d3.scaleLinear()
            .domain([0,10])
            .range([0,250]);

        let speciesScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d["Species_ID_nunique"])])
            .range([0, 250]);

        let endangeredScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d["Species_ID_Endangered"])])
            .range([0, 250]);

        let nativeScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d["Species_ID_Native"])])
            .range([0, 250]);

        let rareScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d["Species_ID_Rare"])])
            .range([0, 250]);

        let sizeScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d["Acres"])])
            .range([0, 250]);

        let scales = [speciesScale, endangeredScale, nativeScale, rareScale, sizeScale]

        function angleToCoordinate(angle, value, scale){
            let x = Math.cos(angle) * scale(value);
            let y = Math.sin(angle) * scale(value);
            return {"x": 300 + x, "y": 300 - y};
        }

        let line = d3.line()
            .x(d => d.x)
            .y(d => d.y);
        let colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(vis.displayData)

        function getPathCoordinates(data_point){
            let coordinates = [];
            for (let i = 0; i < vis.features.length; i++){
                let ft_name = vis.features[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
                coordinates.push(angleToCoordinate(angle, data_point[ft_name], scales[i]));
            }
            return coordinates;
        }

        // console.log("DATA")

        let paths = vis.spiderGroup.selectAll(".paths").data(vis.displayData)

        paths.exit().remove()

        let visColors = []

        paths.enter()
            .append("path")
            .merge(paths)
            .attr("class", "paths")
            .datum(d => getPathCoordinates(d))
            .attr("d", line)
            .attr("fill", d => {
                let color =  colorScale(d)
                visColors.push(color)
                return color
            })
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5);

        // console.log(visColors)


        let legendValues = vis.legend.selectAll(".legendValues")
            .data(vis.displayData);

        legendValues.exit().remove();

        legendValues.enter()
            .append("circle")
            .merge(legendValues)
            .attr("class", "legendValues")
            .attr("cx", 0)
            .attr("cy", (d, i) => i * 30)
            .attr("fill", (d, i) => visColors[i])
            .attr("r", 10)

        let legendText = vis.legend.selectAll(".legendText").data(vis.displayData)

        legendText.exit().remove()

        legendText.enter()
            .append("text")
            .attr("class", "legendText")
            .text(d => d["Park Name"])
            .attr("x", 20)
            .attr("y", (d, i) => (i * 30) + 10);

    }

}