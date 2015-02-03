var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var pool = req.pool;

    // TODO: Get all sensors, then loop through them and build data for each.

    // Get all temperature data for a given sensor.
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("SELECT temp,time FROM temps WHERE sensor = '1'", function(err, rows) {
            if (err) throw err;
            connection.release();
            res.render('index', { title: 'Temperature Monitor', temps: rows });
        });
    });
});

module.exports = router;
