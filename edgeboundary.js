import * as d3 from 'd3';
import * as utils from './utils.js'

// Create edge-bundling chart (adapted from https://bl.ocks.org/mbostock/1044242)
function edgeboundary(id, data) { // TODO split data processing and rendering into separate functions
    // Parse query parameters
    var min_similarity = parseFloat(utils.getUrlVars()['min']) || 0.3;

    var diameter = 600,
        radius = diameter / 2,
        innerRadius = radius - 155; //FIXME: hardcoded offset, instead calculate based on label size

    var cluster = d3.cluster()
        .size([360, innerRadius]);

    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });

    var svg = d3.select("#"+id).append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    var link = svg.append("g").selectAll(".link"),
        node = svg.append("g").selectAll(".node");

    // Append parameter text
    var info = svg.append("text")
        .attr("class", "legend_title")
        .attr("x", -(diameter/2))
        .attr("y", -(diameter/2) + 10)
        .style("text-anchor", "start")
        .text("Edge Filter: " + min_similarity);

    function getThickness(w) {
        return w * 4; //w * 10;
    }

    function getColor(w) { // value from 0 to 1
        var hue=(w*120).toString(10); //((1-w)*120).toString(10);
        return ["hsl(",hue,",100%,50%)"].join("");
    }

    function update() {
        // Parse and format distance matrix
        var scoresById = d3.tsvParse(data);
        var scores = utils.simMatrixToObj(scoresById);
        console.log(scores);

        var root = packageHierarchy(scores);
        cluster(root);

        link = link
            .data(packageImports(root.leaves()))
            .enter().append("path")
                .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
                .attr("class", "link")
                .attr("stroke", "lightgray")
                .attr("stroke-width", function(d) {
                    var w = 0;
                    d.source.data.imports.forEach(function(item) {
                        if (item && item.name == d.target.data.name)
                            w = item.weight;
                    });
                    return getThickness(w);
                })
                .attr("d", line);

      node = node
          .data(root.leaves())
          .enter().append("text")
              .attr("class", "node")
              .attr("dy", ".31em")
              .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
              .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
              .text(function(d) { return d.data.name; })
              .on("mouseover", mouseovered)
              .on("mouseout", mouseouted);
    }

    function mouseovered(d) {
        node
            .each(function(n) { n.target = n.source = false; });

        link
            .each(function(l) {
                if (l.target === d) l.source.source = true;
                if (l.source === d) l.target.target = true;
            })
            .filter(function(l) { return l.target === d || l.source === d; })
            .each(function() { this.parentNode.appendChild(this); });

        link
            .filter(function(l) { return l.target === d || l.source === d; })
            .attr("stroke", function(l) {
                var w = 0;
                l.source.data.imports.forEach(function(item) {
                    if (item && item.name == l.target.data.name)
                        w = item.weight;
                });
                return getColor(w);
            });

        node
            .classed("node--target", function(n) { return n.target; })
            .classed("node--source", function(n) { return n.source; });
    }

    function mouseouted(d) {
        link
            .attr("stroke", "lightgray");

        node
            .classed("node--target", false)
            .classed("node--source", false);
    }

    d3.select(self.frameElement).style("height", diameter + "px");

    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
        var map = {};

        function find(name, data) {
            var node = map[name], i;
            if (!node) {
                node = map[name] = data || {name: name, children: []};
                if (name.length) {
                    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                    node.parent.children.push(node);
                    node.key = name.substring(i + 1);
                }
            }
            return node;
        }

        classes.forEach(function(d) {
            find(d.name, d);
        });

        return d3.hierarchy(map[""]);
    }

    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        var map = {},
            imports = [];

        // Compute a map from name to node.
        nodes.forEach(function(d) {
            map[d.data.name] = d;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
            if (d.data.imports) d.data.imports.forEach(function(i) {
                if (i["weight"] >= min_similarity)
                    imports.push(map[d.data.name].path(map[i["name"]]));
            });
        });

        return imports;
    }

    update();
}

export { edgeboundary };