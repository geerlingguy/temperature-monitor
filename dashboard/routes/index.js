var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Temperature Monitor' });
});

/* SENSORS ------------------------------------------------------------------ */

/* GET sensors route. */
/* Example: GET /sensors */
router.get('/sensors', function(req, res, next) {
    var pool = req.pool;

    // Define the SQL query.
    var sqlQuery = "SELECT * FROM sensors";

    // Get all temperature data for a given sensor.
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(sqlQuery, function(err, rows) {
            if (err) throw err;
            connection.release();
            res.json(rows);
        });
    });
});

/* POST sensors route. */
/* Example: POST /sensors?location=New+Location */
router.post('/sensors', function(req, res, next) {
    var pool = req.pool;

    // If a location is given, create a new sensor, and return the new ID.
    if (typeof req.body.location !== 'undefined') {
        // Define the SQL query.
        var sqlQuery = "INSERT INTO sensors SET ?";
        var sqlPlaceholders = { "location": req.body.location };

        // Add the new sensor to the sensors table, return the new ID.
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(sqlQuery, sqlPlaceholders, function(err, result) {
                if (err) throw err;
                connection.release();
                res.json([result.insertId]);
            });
        });
    }
    else {
        res.status(400).json({ error: 'location parameter missing in the body of the request.' });
    }
});

/* DELETE sensors route. */
/* Example: DELETE /sensors/3 */
router.delete('/sensors/:id', function(req, res, next) {
    var sensor = req.params.id;

    // Warn the user this route is not yet implemented.
    res.status(501).json({ error: 'This functionality has not yet been implemented.' });
});

/* TEMPS -------------------------------------------------------------------- */

/* GET temps route. */
/* Example: GET /temps/1?startTime=123456 */
router.get('/temps/:id', function(req, res, next) {
    var pool = req.pool;

    // Calculate the time 24h ago.
    var defaultTime = Math.round(new Date().getTime() / 1000) - (24 * 3600);

    // Values for query parameters.
    var sensor = req.params.id;
    var time = (typeof req.query.startTime !== 'undefined') ? req.query.startTime : defaultTime;

    // Get all sensor data.
    if (sensor === 'all') {
        // Define the SQL query.
        var sqlQuery = "SELECT sensor,temp,time FROM temps WHERE time > ?";
        var sqlPlaceholders = [time];
        console.log(sqlQuery);

        // Get all temperature data for a given sensor.
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(sqlQuery, sqlPlaceholders, function(err, rows) {
                if (err) throw err;
                connection.release();
                res.json(rows);
            });
        });
    }
    // Get data for given sensor ID.
    else {
        // Define the SQL query.
        var sqlQuery = "SELECT temp,time FROM temps WHERE sensor = ? AND time > ?";
        var sqlPlaceholders = [sensor, time];

        // Get all temperature data for a given sensor.
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(sqlQuery, sqlPlaceholders, function(err, rows) {
                if (err) throw err;
                connection.release();
                res.json(rows);
            });
        });
    }
});

/* POST temps route. */
/* Example: POST /temps?sensor=1&time=123456&temp=72.06 */
router.post('/temps/:id', function(req, res, next) {
    // TODO.
});

module.exports = router;
