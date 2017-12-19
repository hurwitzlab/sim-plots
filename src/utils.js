function simMatrixToObj(simMatrix) {
    var scoresById = [];

    simMatrix.forEach(function(row) {
        var id1 = row[""];
	    if (id1 !== "") {
            var imports = [];
            Object.keys(row).forEach(function(id2) {
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

function simMatrixToTuples(simMatrix) {
    var tuples = [];

    simMatrix.forEach(function(row) {
        var id1 = row[""];

        Object.keys(row).forEach(function(id2) {
            if (id2 !== "" && id1 !== id2) {
                tuples.push(row[id2]);
            }
        });
    });

    return tuples;
}

function traverse(parent) {
    if (!parent)
        return [];
    else if (parent.size == 1)
        return [ parent.canonical ];
    else {
        var leftNodes = traverse(parent.left);
        var rightNodes = traverse(parent.right);
        leftNodes.push(...rightNodes);
        return leftNodes;
    }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

//export {simMatrixToObj};
//export {getUrlVars};
