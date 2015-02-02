var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Connect to MySQL.
  var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'temperature_log'
  });

  // TODO: Get all sensors, then loop through them and build data for each.

  // Get all temperature data for a given sensor.
  connection.query("SELECT temp,time FROM temps WHERE sensor = '1'", function(err, rows, fields) {
    if (err) throw err;
    res.render('index', { title: 'Temperature Monitor', temps: rows });
  });

  // Close the MySQL connection.
  connection.end();
});

module.exports = router;
