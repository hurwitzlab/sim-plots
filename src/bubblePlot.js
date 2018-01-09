import * as d3 from 'd3-v3';
import * as bubble from 'd3.chart.bubble-matrix';

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

    var chart = d3.select('#plot').append('svg')
                  .chart('BubbleMatrix')
                  .width(width).height(height)
                  .slanted(true);

    chart.draw(data2);
}

export { bubblePlot };