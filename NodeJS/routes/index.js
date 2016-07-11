/**
 * Created by vmurali on 6/17/16.
 */

'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', {title: 'Puzzle Solver'});
});

module.exports = router;