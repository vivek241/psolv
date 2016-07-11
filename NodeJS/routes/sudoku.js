/**
 * Created by vmurali on 7/8/16.
 */

'use strict';

var logger = require('winston');
var router = require('express').Router();
var sudokuService = require('../services/sudokuService');

router.post('/*', function (req, res, next) {
    // Input validation
    var grid = req.body.sudoku;
    var validSudokuPattern = /^[0-9.]{81}$/;
    logger.info('Validating Sudoku string: ' + grid);
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
    var solution = sudokuService.gridToString(values);
    var valid = sudokuService.validate(solution);
    if (!valid) {
        solution = false;
    }
    logger.info('Solution: ' + solution);
    res.status(200).json({solution: solution});
});

router.post('/validate', function (req, res, next) {
    var grid = req.body.sudoku;
    var valid = sudokuService.validate(grid);
    logger.info('Valid: ' + valid);
    res.status(200).json({valid: valid});
});

module.exports = router;