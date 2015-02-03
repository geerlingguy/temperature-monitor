var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Temperature Monitor' });
});

/* GET temps page. */
router.get('/temps', function(req, res, next) {
    var pool = req.pool;

    // TODO: Only load data for given sensor ID.

    // Get all temperature data for a given sensor.
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("SELECT temp,time FROM temps WHERE sensor = '1'", function(err, rows) {
            if (err) throw err;
            connection.release();
            res.json(rows);
        });
    });
});

module.exports = router;
