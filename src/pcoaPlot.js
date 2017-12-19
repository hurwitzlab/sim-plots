import * as d3 from 'd3';
import * as numeric from 'numericjs';
import * as mdslib from '../mds.js/mds.js';

function pcoaPlot(id, data, params) { // TODO split data processing and rendering into separate functions
    params = params || {};

    // Parse and format distance matrix
    var scores = d3.tsvParse(data);
    console.log(scores);

    var matrix = [];
    var labels = [];
    for (var i = 0;  i < scores.length;  i++) {
        var row = scores[i];

        var j = 0;
        for (var key in row) {
            if (key === "")
                labels.push(row[""]);
            else {
                if (typeof matrix[i] === "undefined")
                    matrix[i] = [];
                matrix[i][j++] = row[key];
            }
        }
    }

    var mds = new mdslib.mds();

    var positions = numeric.transpose(mds.classic(matrix));

    mds.drawD3ScatterPlot(d3.select("#"+id),
        positions[0],
        positions[1],
        labels,
        {
            w : params.width || Math.min(document.documentElement.clientWidth - 20),
            h : params.height || Math.min(document.documentElement.clientHeight - 20),
            padding : (typeof params.padding === "undefined" ? 100 : params.padding)
        });
}

export { pcoaPlot };