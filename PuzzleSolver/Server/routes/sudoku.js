/**
 * Created by vmurali on 6/17/16.
 */

'use strict';

var _ = require('lodash');
var router = require('express').Router();

var cross = function (A, B) {
    var result = [];
    A.forEach(function (a) {
        B.forEach(function (b) {
            result.push(a + b);
        });
    });
    return result;
};

var i, j;
var rowNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
var columnNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

var squares = cross(rowNames, columnNames);

var unitlist = [];
rowNames.forEach(function (rowName) {
    unitlist.push(cross([rowName], columnNames));
});
columnNames.forEach(function (columnName) {
    unitlist.push(cross(rowNames, [columnName]));
});
for (i = 0; i < 9; i += 3) {
    var rowNamesSubArray = rowNames.slice(i, i + 3);
    for (j = 0; j < 9; j += 3) {
        var columnNamesSubArray = columnNames.slice(j, j + 3);
        unitlist.push(cross(rowNamesSubArray, columnNamesSubArray));
    }
}

var units = {};
unitlist.forEach(function (unit) {
    unit.forEach(function (square) {
        if (!units[square]) {
            units[square] = [unit];
        } else {
            units[square].push(unit);
        }
    });
});

var peers = {};
squares.forEach(function (square) {
    units[square].forEach(function (unit) {
        if (!peers[square]) {
            peers[square] = _.without(unit, square);
        } else {
            _.without(unit, square).forEach(function (peer) {
                if (peers[square].indexOf(peer) === -1) {
                    peers[square].push(peer);
                }
            });
        }
    });
});

var getGridValues = function (gridArray) {
    var gridValues = {};
    for (var i = 0; i < 81; i++) {
        var square = squares[i];
        var gridValue = gridArray[i];
        gridValues[square] = (columnNames.indexOf(gridValue) !== -1 ? gridValue : '.');
    }
    return gridValues;
};

var parseGrid = function (grid) {
    var values = {};
    squares.forEach(function (square) {
        values[square] = columnNames;
    });
    var gridValues = getGridValues(grid);
    var count = 0;
    for (var s in gridValues) {
        var d = gridValues[s];
        if (columnNames.indexOf(d) !== -1 && !assign(values, s, d)) {
            return false;
        }
        count++;
    }
    return values;
};

var assign = function (values, s, d) {
    var otherValues = _.without(values[s], d);
    var res = true;
    otherValues.forEach(function (d2) {
        if (!eliminate(values, s, d2)) {
            res = false;
        }
    });
    return res ? values : false;
};

var eliminate = function (values, s, d) {
    if (values[s].indexOf(d) === -1) {
        return values;
    }

    var updated = [];
    values[s].forEach(function (v) {
        if (v !== d) {
            updated.push(v);
        }
    });
    values[s] = updated;

    if (values[s].length === 0) {
        return false;
    } else if (values[s].length === 1) {
        var d2 = values[s][0];
        var res = true;
        peers[s].forEach(function (s2) {
            if (!eliminate(values, s2, d2)) {
                res = false;
            }
        });
        if (!res) {
            return false;
        }
    }

    units[s].forEach(function (u) {
        var dplaces = [];
        u.forEach(function (sq) {
            if (values[sq].indexOf(d) !== -1) {
                dplaces.push(sq);
            }
        });

        if (dplaces.length === 0) {
            return false;
        } else if (dplaces.length === 1) {
            if (!assign(values, dplaces[0], d)) {
                return false;
            }
        }
    });

    return values;
};

/*
def solve(grid): return search(parse_grid(grid))

def search(values):
"Using depth-first search and propagation, try all possible values."
if values is False:
    return False ## Failed earlier
if all(len(values[s]) == 1 for s in squares):
return values ## Solved!
## Chose the unfilled square s with the fewest possibilities
n,s = min((len(values[s]), s) for s in squares if len(values[s]) > 1)
return some(search(assign(values.copy(), s, d))
    for d in values[s])

def some(seq):
"Return some element of seq that is true."
for e in seq:
if e: return e
return False
*/

router.get('/', function (req, res) {
    var grid = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......'.split('');
    // var grid = '003020600900305001001806400008102900700000008006708200002609500800203009005010300'.split('');
    var values = parseGrid(grid);
    res.status(200).json(values);
});

module.exports = router;