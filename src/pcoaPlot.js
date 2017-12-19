import * as d3 from 'd3';

function pcoaPlot(id, data) { // TODO split data processing and rendering into separate functions
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

    var positions = numeric.transpose(mds.classic(matrix));

    mds.drawD3ScatterPlot(d3.select("#"+id),
        positions[0],
        positions[1],
        labels,
        {
            w :  Math.min(document.documentElement.clientWidth - 20),
            h : Math.min(document.documentElement.clientHeight - 20),
            padding : 100
        });
}

export { pcoaPlot };