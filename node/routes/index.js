var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'test'
  });

  res.render('index', { title: 'Temperature Monitor' });
});

module.exports = router;
