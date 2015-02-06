var express = require('express');
var router = express.Router();

/* GET sensors route. */
/* Example: GET /sensors */
router.get('/', function(req, res, next) {
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
router.post('/', function(req, res, next) {
    var pool = req.pool;

    // If a location is given, create a new sensor, and return the new ID.
    if (typeof req.body.location !== 'undefined') {
        var location = req.body.location;

        // Validate the location.
        if (location.length > 128) {
            res.status(400).json({ error: 'Location must be less than or equal to 128 characters.' });
            return;
        }

        // Define the SQL query.
        var sqlQuery = "INSERT INTO sensors SET ?";
        var sqlPlaceholders = { "location": location };

        // Add the new sensor to the sensors table, return the new ID.
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(sqlQuery, sqlPlaceholders, function(err, result) {
                if (err) throw err;
                connection.release();
                res.json({ "id": result.insertId });
            });
        });
    }
    else {
        res.status(400).json({ error: 'location parameter missing in the body of the request.' });
    }
});

/* DELETE sensors route. */
/* Example: DELETE /sensors/3 */
router.delete('/:id', function(req, res, next) {
    var sensor = req.params.id;

    // Warn the user this route is not yet implemented.
    res.status(501).json({ error: 'This functionality has not yet been implemented.' });
});

module.exports = router;
