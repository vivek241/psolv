/**
 * Created by vmurali on 7/8/16.
 */

'use strict';

var router = require('express').Router();
var sudokuService = require('../services/sudokuService');

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
    var values = sudokuService.solve(grid);
    var solutionString = sudokuService.gridToString(values);
    res.status(200).json({solution: solutionString});
});

router.post('/validate', function (req, res, next) {
    var grid = req.body.sudoku;
    var valid = sudokuService.validate(grid);
    res.status(200).json({valid: valid});
});

//TODO: dont commit node_modules
//TODO: Add config, logger

module.exports = router;