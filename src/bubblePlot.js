import * as chart from 'd3.chart.bubble-matrix/dist/chart.js';
require('d3.chart.bubble-matrix/dist/style.css');
require('d3.chart.bubble-matrix/dist/theme.css');

function bubblePlot(id, data, params) { // TODO split data processing and rendering into separate functions
    params = params || {};

    // Convert input data into format required by d3.chart.bubble-matrix
    var scores = d3.csv.parse(data);
    var columns = {};
    var rows = {};
    var maxValue = 0;

//    console.log("data:", data);
//    console.log("scores:", scores);

    scores.forEach(function(row) {
        if (!row.sample || !row.name || !row.proportion)
            console.error("sim-plots:bubblePlot: missing required field: ", row);

        columns[row.sample] = 1;

        if (typeof rows[row.name] === 'undefined')
            rows[row.name] = {};
        rows[row.name][row.sample] = row.proportion * 1; // convert to int with *1

        maxValue = Math.max(maxValue, row.proportion);
    });

//    console.log("maxValue:", maxValue);
//    console.log("columns:", columns);
//    console.log("rows:", rows);

    var rows2 = [];
    Object.keys(rows).sort().reverse().forEach(function(name) {
        var values =
            Object.keys(columns).map(sample => {
                return [ (rows[name][sample] || 0) / maxValue, 0 ]; // don't know what the second value is for
            });

        rows2.push({
            name: name,
            values: values
        });
    });

    var data2 = {
        columns: Object.keys(columns),
        rows: rows2
    };
//    console.log("data2:", data2);

    var width = Object.keys(columns).length * 200;
    var height = Object.keys(rows).length * 40;

    d3.select('#'+id)
    .append('svg')
    .chart('BubbleMatrix')
    .width(width).height(height)
    .slanted(true)
    .draw(data2);
}

export { bubblePlot };