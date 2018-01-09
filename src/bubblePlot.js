import * as chart from 'd3.chart.bubble-matrix/dist/chart.js';
require('d3.chart.bubble-matrix/dist/style.css');
require('d3.chart.bubble-matrix/dist/theme.css');

function bubblePlot(id, data, params) { // TODO split data processing and rendering into separate functions
    params = params || {};

    // Convert input data into format required by d3.chart.bubble-matrix
    var scores = d3.csv.parse(data);
    var columns = {};
    var rows = {};
    var maxValue = 10;
    scores.forEach(function(row) {
        columns[row.sample] = 1;

        if (typeof rows[row.Name] === 'undefined')
            rows[row.Name] = {};
        rows[row.Name][row.sample] = row.Abundance;

        maxValue = Math.max(maxValue, row.Abundance);
    });

    var rows2 = [];
    Object.keys(rows).sort().reverse().forEach(function(name) {
        var values =
            Object.keys(columns).map(sample => {
                return [ (rows[name][sample] || 0) / maxValue, 0.7 ];
            });
        rows2.push({
            name: name,
            values: values
        });
    });

    var data2 = { columns: Object.keys(columns), rows: rows2 };

    var width = Object.keys(columns).length * 200;
    var height = Object.keys(rows).length * 40;

    var chart = d3.select('#'+id).append('svg')
                  .chart('BubbleMatrix')
                  .width(width).height(height)
                  .slanted(true);

    chart.draw(data2);
}

export { bubblePlot };