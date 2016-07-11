/**
 * Created by vmurali on 7/8/16.
 */

'use strict';

var _ = require('lodash');
var router = require('express').Router();

// Initial setup
var cross = function (A, B) {
    var result = [];
    for (var i = 0; i < A.length; i++) {
        for (var j = 0; j < B.length; j++) {
            result.push(A[i] + B[j]);
        }
    }
    return result;
};

var i, j;
var rows = 'ABCDEFGHI';
var columns = '123456789';

var squares = cross(rows, columns);

var unitlist = [];
for (i = 0; i < rows.length; i++) {
    unitlist.push(cross(rows[i], columns));
}
for (i = 0; i < columns.length; i++) {
    unitlist.push(cross(rows, columns[i]));
}
for (i = 0; i < rows.length; i += 3) {
    var rowsSub = rows.slice(i, i + 3);
    for (j = 0; j < columns.length; j += 3) {
        var columnsSub = columns.slice(j, j + 3);
        unitlist.push(cross(rowsSub, columnsSub));
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

var getGridValues = function (grid) {
    var gridValues = {};
    for (var i = 0; i < grid.length; i++) {
        var square = squares[i];
        var value = grid[i];
        gridValues[square] = (columns.indexOf(value) !== -1 ? value : '.');
    }
    return gridValues;
};

var parseGrid = function (grid) {
    var values = {};
    squares.forEach(function (square) {
        values[square] = columns;
    });
    var gridValues = getGridValues(grid);
    for (var s in gridValues) {
        var d = gridValues[s];
        if (columns.indexOf(d) !== -1 && !assign(values, s, d)) {
            return false;
        }
    }
    return values;
};

var assign = function (values, s, d) {
    var otherValues = values[s].replace(d, '');
    var res = true;
    for (var i = 0; i < otherValues.length; i++) {
        var d2 = otherValues[i];
        if (!eliminate(values, s, d2)) {
            res = false;
        }
    }
    return res ? values : false;
};

var eliminate = function (values, s, d) {
    if (values[s].indexOf(d) === -1) {
        return values;
    }

    values[s] = values[s].replace(d, '');

    if (values[s].length === 0) {
        return false;
    } else if (values[s].length === 1) {
        var d2 = values[s];
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

    for (var i = 0; i < units[s].length; i++) {
        var u = units[s][i];
        var dplaces = [];
        for (var k = 0; k < u.length; k++) {
            var sq = u[k];
            if (values[sq].indexOf(d) !== -1) {
                dplaces.push(sq);
            }
        }

        if (dplaces.length === 0) {
            return false;
        } else if (dplaces.length === 1) {
            if (!assign(values, dplaces[0], d)) {
                return false;
            }
        }
    }

    return values;
};

var solve = function (grid) {
    return search(parseGrid(grid));
};

var search = function (values) {
    if (values === false) {
        return false;
    }

    var solved = _.every(squares, function (s) {
        return (values[s].length === 1);
    });
    if (solved) {
        return values;
    }

    var n = 9;
    var sq = 'A1';
    for (var k = 0; k < squares.length; k++) {
        var s = squares[k];
        if (values[s].length > 1 && values[s].length < n) {
            n = values[s].length;
            sq = s;
        }
    }

    for (var k = 0; k < values[sq].length; k++) {
        var d = values[sq][k];
        return some(search(assign(_.clone(values), s, d)));
    }
};

var some = function (seq) {
    for (var i = 0; i < seq.length; i++) {
        var e = seq[i];
        if (e) {
            return e;
        }
    }
    return false;
};

var validate = function (grid) {
    var values = parseGrid(grid);
    for (var i = 0; i < unitlist.length; i++) {
        var unit = unitlist[i];
        var validUnit = [false, false, false, false, false, false, false, false, false];
        for (var k = 0; k < unit.length; k++) {
            var square = unit[k];
            var index = Number(values[square]) - 1;
            validUnit[index] = true;
        }
        if (!_.every(validUnit, Boolean)) {
            return false;
        }
    }
    return true;
};

router.post('/', function (req, res, next) {
    // Input validation
    var grid = req.body.sudoku;
    var validSudokuPattern = /^[0-9.]{81}$/;
    if (!validSudokuPattern.test(grid)) {
        var err = new Error('Invalid payload. Please send a valid sudoku string');
        err.status = 400;
        return next(err);
    }
    return next();
});

router.post('/solve', function (req, res) {
    var grid = req.body.sudoku;
    var values = solve(grid);
    var solution = '';
    Object.keys(values).sort().forEach(function (square) {
        solution += values[square];
    });
    res.status(200).json({solution: solution});
});

router.post('/validate', function (req, res, next) {
    var grid = req.body.sudoku;
    var valid = validate(grid);
    res.status(200).json({valid: valid});
});

//TODO: make a service which solves and validates
//TODO: dont commit node_modules
//TODO: Add logger
//TODO: Add configs
//TODO: Add unit tests?

module.exports = router;