import * as d3 from 'd3';
import * as numeric from 'numericjs';
import * as mdslib from 'mds.js';
import {shortenLabel} from './utils.js';

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
                labels.push(shortenLabel(row[""]));
            else {
                if (typeof matrix[i] === "undefined")
                    matrix[i] = [];
                matrix[i][j++] = row[key];
            }
        }
    }

    let maxLabelLen = labels.reduce((maxLen,label) => Math.max(maxLen,label.length),0);
    console.log("maxLabelLen", maxLabelLen);

    var mds = new mdslib.mds();

    try {
        var positions = numeric.transpose(mds.classic(matrix));

        mds.drawD3ScatterPlot(d3.select("#"+id),
            positions[0],
            positions[1],
            labels,
            {
                w : params.width || window.screen.width * .8 - maxLabelLen * 4 * 2, 
                h : params.height || window.screen.height * .8, 
                padding : params.padding || maxLabelLen * 4
            });
    }
    catch (error) {
        console.error("pcoaPlot: error: ", error);
    }
}

export { pcoaPlot };
