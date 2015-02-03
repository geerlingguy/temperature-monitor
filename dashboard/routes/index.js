var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Temperature Monitor' });
});

/* GET temps page. */
router.get('/temps', function(req, res, next) {
    var pool = req.pool;

    // Calculate the time 24h ago.
    var defaultTime = Math.round(new Date().getTime() / 1000) - (24 * 3600);

    // Default values for query parameters.
    var sensor = (typeof req.query.sensor !== 'undefined') ? req.query.sensor : 1;
    var time = (typeof req.query.startTime !== 'undefined') ? req.query.startTime : defaultTime;

    // Get all temperature data for a given sensor.
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("SELECT temp,time FROM temps WHERE sensor = ? AND time > ?", [sensor, time], function(err, rows) {
            if (err) throw err;
            connection.release();
            res.json(rows);
        });
    });
});

module.exports = router;
