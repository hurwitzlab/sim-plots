function simMatrixToObj(simMatrix) {
    var scoresById = [];

    simMatrix.forEach(row => {
        var id1 = row[""];
	    if (id1 !== "") {
            var imports = [];
            Object.keys(row).forEach(id2 => {
                if (id2 !== "" && id1 !== id2) {
                    imports.push({
                        name: id2,
                        weight: row[id2]
                    });
                }
            });

            scoresById.push({
                name: id1,
                imports: imports
            });
        }
    });

    return scoresById;
}

function ohanaBlastTabToObj(hits) {
    // Calculate frequency of hits for by station and depth
    var freq = [];

    hits.forEach(hit => {
        var fields = /^([a-z0-9]+)_([a-z0-9]+_)?0*(\d+)m/i.exec(hit.sseqid);
        var name = fields[1];
        var depth = fields[3];

        if (typeof freq[name] === 'undefined')
            freq[name] = [];
        if (typeof freq[name][depth] === 'undefined')
            freq[name][depth] = 0;
        freq[name][depth] += hit.count*1; // multiply by 1 to convert to int
    });

    return freq;
}

function shortenLabel(s) {
    return s.replace(/(\.fasta|\.fa|\.fastq|\.fq)$/i, "");
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

export {simMatrixToObj};
export {ohanaBlastTabToObj};
export {shortenLabel};
export {getUrlVars};
