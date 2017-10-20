import * as d3 from 'd3';
import {simMatrixToObj} from './utils.js'

function getColor(w) {
    // Value from 0 to 1
    var hue=(w*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

function heatmap(data) { // TODO split data processing and rendering into separate functions
    console.log(data);

    var scoresById = d3.tsvParse(data);
    console.log(scoresById);

    var scores = simMatrixToObj(scoresById);
    console.log(scores);

    // array of {name, group}
    var nodes = [];
    var nodes_map = {};
    scores.forEach(function(node, i) {
        var idx_grp = node.name.indexOf('.');
        var group = "g";
        var name = node.name;
        if(idx_grp >= 0) {
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

    var innerRadius = 720;
    var margin = {top: 200, right: 0, bottom: 10, left: 200},
        width = innerRadius,
        height = innerRadius;

    var x = d3.scaleBand().rangeRound([0, width]),
        z = d3.scaleLinear().domain([0, 4]).clamp(true),
        c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));

    var svg = d3.select("div#sim-plot").html().append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.style("margin-left", -margin.left + "px")
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

    svg.append("rect")
        .attr("class", "background")
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
        .attr("x", -6)
        .attr("y", x.bandwidth() / 2) //x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
            .attr("class", "column")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x.bandwidth() / 2) //x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function(d) { return x(d.x); })
                .attr("width", x.bandwidth()) //x.rangeBand())
                .attr("height", x.bandwidth()) //x.rangeBand())
                .attr("fill", function(d) {
                    return getColor(d.z);
                })
                //.style("fill-opacity", function(d) { return z(d.z); })
                //.style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
    }

    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
        d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    d3.select("#order").on("change", function() {
        clearTimeout(timeout);
        order(this.value);
    });

    function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(2500);

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

    var timeout = setTimeout(function() {
        order("group");
        d3.select("#order").property("selectedIndex", 2).node().focus();
    }, 5000);
}

export { heatmap };
