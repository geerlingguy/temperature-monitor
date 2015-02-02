var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // var connection = mysql.createConnection({
  //   host: 'localhost',
  //   user: 'test',
  //   password: 'test'
  // });
  // connection.connect();
  // connection.query("SELECT * FROM temps", function(err, rows, fields) {
  //   if (err) throw err;
  //   console.log(rows);
  // });

  res.render('index', { title: 'Temperature Monitor' });
});

module.exports = router;
