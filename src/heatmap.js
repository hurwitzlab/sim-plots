import * as d3 from 'd3';
import {legendColor} from 'd3-svg-legend';
import {simMatrixToObj, ohanaBlastTabToObj} from './utils.js';

function heatmap(id, data) { // TODO split data processing and rendering into separate functions
    var obj = d3.tsvParse(obj);
    obj = ohanaBlastTabToObj(obj);
    console.log(obj);

    // Get row and column labels
    var xLabels = {};
    var yLabels = {};
    Object.keys(obj).forEach(xLabel => {
        xLabels[xLabel] = 1;
        Object.keys(obj[xLabel]).forEach(yLabel => {
            yLabels[yLabel] = 1;
        });
    });
    xLabels = Object.keys(xLabels);
    yLabels = Object.keys(yLabels);

    // Build heatmap matrix
    var matrix = [];
    var maxFreq = 0;
    yLabels.forEach((yLabel, yIndex) => {
        xLabels.forEach((xLabel, xIndex) => {
            var freq = obj[xLabel][yLabel] || 0;

            if (typeof matrix[yIndex] === 'undefined')
                matrix[yIndex] = [];
            matrix[yIndex][xIndex] = {
                x: xIndex,
                y: yIndex,
                z: freq
            }

            maxFreq = Math.max(maxFreq, freq);
        });
    });
    console.log("matrix:", matrix);


    //
    // Rendering
    //

    // Create background
    var margin = { top: 0, right: 200, bottom: 100, left: 0 },
        width = xLabels.length * 50,
        height = yLabels.length * 50;

    var container = d3.select('#'+id);
    var svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Sort columns and rows by label
    var xDomain = d3.range(xLabels.length).sort(function(a, b) { return d3.ascending(xLabels[a], xLabels[b]); });
    var yDomain = d3.range(yLabels.length).sort(function(a, b) { return d3.ascending(yLabels[a]*1, yLabels[b]*1); }); // use *1 to force integer sort
    var x = d3.scaleBand().rangeRound([0, width]);
    var y = d3.scaleBand().rangeRound([0, height]);
    x.domain(xDomain);
    y.domain(yDomain);

    // Setup color scale
    var colorScale = d3.scaleLinear().domain([1, maxFreq]).range(['yellow', 'orange']);

    // Draw heatmap
    svg.append("rect")
        .attr("class", "background")
        .attr("fill", "white")
        .attr("width", width)
        .attr("height", height);

    // Draw rows
    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
            .attr("class", "row")
            .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
            .each(function(row) {
                d3.select(this).selectAll(".cell")
                    .data(row.filter(function(d) { return d.z; }))
                    .enter().append("rect")
                        .attr("class", "cell")
                        .attr("x", function(d) { return x(d.x); })
                        .attr("width", x.bandwidth())
                        .attr("height", x.bandwidth())
                        .attr("fill", function(d) { return colorScale(d.z); })
                        .on("mouseover", mouseover)
                        .on("mouseout", mouseout);
            });

    row.append("text")
        .attr("x", width + 5)
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .attr("font-family", "Arial")
        .attr("font-size", "0.85em")
        .attr("fill", "dimgray")
        .text(function(d, i) { return yLabels[i]; });

    // Draw column labels
    var column = svg.selectAll(".column")
        .data(xLabels)
        .enter().append("g")
            .attr("class", "column")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("text")
        .attr("x", -height - 5)
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "0.85em")
        .attr("fill", "dimgray")
        .text(function(d, i) { return xLabels[i]; });

    // Interaction handlers
    function mouseover(p) {
        svg.selectAll(".row text").classed("active", function(d, i) { return (i == p.y) });
        svg.selectAll(".column text").classed("active", function(d, i) { return (i == p.x) });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    // Draw legend
    var legendLinear = legendColor()
        .shapeWidth(15)
        .cells(Math.min(maxFreq, 5))
        .orient("vertical")
        .scale(colorScale)
        .labelFormat("d")
        .title("Frequency");

    svg.append("g")
        .attr("font-family", "Arial")
        .attr("fill", "dimgray")
        .attr("transform", "translate(" + (width + 100) + "," + (height/2 - 20) + ")")
        .call(legendLinear);
}

function symmetricalHeatmap(id, data) { // TODO split data processing and rendering into separate functions
    // Parse and format distance matrix
    var scoresById = d3.tsvParse(data);
    var scores = simMatrixToObj(scoresById);
    //console.log(scores);

    // array of {name, group}
    var nodes = [];
    var nodes_map = {};
    scores.forEach(function(node, i) {
        var idx_grp = node.name.indexOf('.');
        var group = "g";
        var name = node.name;
        if (idx_grp >= 0) {
            group = node.name.substring(0,idx_grp);
            name = node.name.substring(idx_grp+1);
        }

        var n = {"name": name, "group": group, "index": i, "count": 0};
        nodes.push(n);
        nodes_map[node.name] = n;
    });

    // Compute index per node
    var n = nodes.length;
    var matrix = [];
    nodes.forEach(function(node, i) {
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });
    console.log("nodes:", nodes);

    // Convert links to matrix; count character occurrences.
    scores.forEach(function(node) {
        var imports = node.imports;
        var node_source = node.name;
        var node_source_index = nodes_map[node_source].index;
        imports.forEach(function(edge) {
            var node_target = edge.name;
            var node_target_index = nodes_map[node_target].index;
            var weight = edge.weight;

            matrix[node_source_index][node_target_index].z = weight;
            nodes[node_source_index].count += weight;
        });
        matrix[node_source_index][node_source_index].z = 1.0;
    });
    console.log("matrix:", matrix);

    var innerRadius = 400;
    var margin = {top: 0, right: 200, bottom: 200, left: 0},
        width = innerRadius,
        height = innerRadius;

    var x = d3.scaleBand().rangeRound([0, width]),
        z = d3.scaleLinear().domain([0, 4]).clamp(true),
        c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));


    // Create menu and svg
    var container = d3.select('#'+id);

    var menu = container
        .html('<aside style="margin-top:0px;"><p>Order: <select id="order"><option value="group">by Group</option><option value="name">by Name</option><option value="count">by Frequency</option></select></aside>');

    var svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Precompute the orders
    var n = nodes.length;
    var orders = {
        name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
        group: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].group, nodes[b].group); })
    };

    // The default sort order
    x.domain(orders.group);

    // Draw heatmap and labels
    svg.append("rect")
        .attr("class", "background")
        .attr("fill", "white")
        .attr("width", width)
        .attr("height", height);

    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
            .attr("class", "row")
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", width )
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
            .attr("class", "column")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", -width)
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    function getColor(w) { // value from 0 to 1
        var hue=(w*120).toString(10);
        return ["hsl(",hue,",100%,50%)"].join("");
    }

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function(d) { return x(d.x); })
                .attr("width", x.bandwidth())
                .attr("height", x.bandwidth())
                .attr("fill", function(d) {
                    return getColor(d.z);
                })
                //.style("fill-opacity", function(d) { return z(d.z); })
                //.style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
    }


    // Add interaction handlers
    function mouseover(p) {
        svg.selectAll(".row text").classed("active", function(d, i) { return (i == p.y) });
        svg.selectAll(".column text").classed("active", function(d, i) { return (i == p.x) });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    menu.select("select").on("change", function() {
        order(this.value);
    });

    function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(1000);

        t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x(d.x) * 4; })
            .attr("x", function(d) { return x(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }
}

export { heatmap };
export { symmetricalHeatmap };
