/*
 * Create the gradient for the legend
 */

//Extra scale since the color scale is interpolated
var legend_svg = d3.select("body").append("svg")
    .attr("width", 960)
    .attr("height", 100)
  .append("g")
    .attr("transform", "translate(" + 960/2 + "," + 30 + ")");

var tempScale = d3.scaleLinear()
	.domain([0, 100])
	.range([0, 960]);

// Calculate the variables for the temp gradient
var numStops = 10;
tempRange = tempScale.domain();
tempRange[2] = tempRange[1] - tempRange[0];
tempPoint = [];
for(var i = 0; i < numStops; i++) {
	tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
}//for i

// Base the color scale on average temperature extremes
var colorScale = d3.scaleLinear()
	.domain([0, 100])
	.range([getColor(0), getColor(1)])
	.interpolate(d3.interpolateHcl);

// Create the gradient
legend_svg.append("defs")
	.append("linearGradient")
	.attr("id", "legend-weather")
	.attr("x1", "0%").attr("y1", "0%")
	.attr("x2", "100%").attr("y2", "0%")
	.selectAll("stop")
	.data(d3.range(numStops))
	.enter().append("stop")
	.attr("offset", function(d,i) { return tempScale( tempPoint[i] )/960; })
	.attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });


/*
 * Draw the legend
 */

var legendWidth = 400;

// Color Legend container
var legendsvg = legend_svg.append("g")
	.attr("transform", "translate(" + 0 + "," + 0 + ")");

// Draw the Rectangle
legendsvg.append("rect")
	.attr("x", -legendWidth/2)
	.attr("y", 0)
	.attr("rx", 8/2)
	.attr("width", legendWidth)
	.attr("height", 8)
	.style("fill", "url(#legend-weather)");

// Append title
legendsvg.append("text")
    .attr("class", "legend_title")
	.attr("x", 0)
	.attr("y", -10)
	.style("text-anchor", "middle")
	.text("Similarity");

// Set scale for x-axis
var xScale = d3.scaleLinear()
	 .range([-legendWidth/2, legendWidth/2])
	 .domain([0,100] );

// Define x-axis
var xAxis = d3.axisBottom()//d3.svg.axis()
	  //.orient("bottom")
	  .ticks(10)
	  .tickFormat(function(d) { return d + "%"; })
	  .scale(xScale);

// Set up X axis
legendsvg.append("g")
	.attr("class", "legend_axis")
	.attr("transform", "translate(0," + (10) + ")")
	.call(xAxis);
