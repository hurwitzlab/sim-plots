function simMatrixToObj(simMatrix) {
    var scoresById = [];

    simMatrix.forEach(function(row) {
        var id1 = row[""];

        var imports = [];
        Object.keys(row).forEach(function(id2) {
            if (id2 !== "" && id1 !== id2) {
                imports.push({
                    name: id2,
                    weight: 1-row[id2]
              });
          }
        });

        scoresById.push({
            name: id1,
            imports: imports
        });
    });

    return scoresById;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}