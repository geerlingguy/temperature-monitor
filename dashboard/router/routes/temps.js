var express = require('express');
var router = express.Router();
var async = require('async');

/* GET temps route. */
/* Example: GET /temps/1?startTime=123456 */
router.get('/:id', function(req, res, next) {
    var pool = req.pool;

    // TODO - Get sensor data synchronously?
    var sensors = {};

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
    }
    // Get data for given sensor ID.
    else {
        // Define the SQL query.
        var sqlQuery = "SELECT sensor,temp,time FROM temps WHERE sensor = ? AND time > ?";
        var sqlPlaceholders = [sensor, time];
    }

    // Get sensor data, and pass it along to temperature data query.
    async.waterfall([
        function(callback) {
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query("SELECT * FROM sensors", function(err, rows) {
                    if (err) throw err;
                    connection.release();
                    var sensorData = {};
                    for (var i = 0; i < rows.length; i++) {
                        sensorData[rows[i]['id']] = rows[i]['location']
                    };
                    callback(null, sensorData);
                });
            });
        },
        function(sensorData, callback) {
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(sqlQuery, sqlPlaceholders, function(err, rows) {
                    if (err) throw err;
                    var temperatureData = groupResultsBySensor(rows, sensorData);
                    connection.release();
                    callback(null, temperatureData);
                });
            });
        }
    ], function(err, temperatureData) {
        res.json(temperatureData);
    });
});

/* POST temps route. */
/* Example: POST /temps { sensor: 1, temp: 72.06, time: 123456 } */
router.post('/', function(req, res, next) {
    var pool = req.pool;
    if (typeof req.body.sensor !== 'undefined'
          && typeof req.body.temp !== 'undefined'
          && typeof req.body.time !== 'undefined') {
        var sensor = req.body.sensor;
        var temp = req.body.temp;
        var time = req.body.time;

        // Validate temperature.
        if (!isFloat(temp)) {
            res.status(400).json({ error: 'Temperature must be a float.' });
            return;
        }
        // Validate time.
        else if (!isPositiveInteger(time)) {
            res.status(400).json({ error: 'Time must be a positive integer.' });
            return;
        }
        // Validate sensor.
        else if (!isPositiveInteger(sensor)) {
            res.status(400).json({ error: 'Sensor must be a positive integer.' });
            return;
        }

        // Define the SQL query.
        var sqlQuery = "INSERT INTO temps SET ?";
        var sqlPlaceholders = {
            "sensor": req.body.sensor,
            "temp": req.body.temp,
            "time": req.body.time
        };

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
        res.status(400).json({ error: 'Required parameter(s) missing in the body of the request.' });
    }
});

// Return true if variable is a float.
function isFloat(str) {
    return !isNaN(str) && str.toString().indexOf('.') != -1;
}

// Return true if variable is a positive integer (> 0).
function isPositiveInteger(str) {
    var n = ~~Number(str);
    return String(n) === str && n > 0;
}

// Group an array by key.
function groupResultsBySensor(array, sensorData) {
  var groups = {};

  array.forEach(function(o) {
    var k = o['sensor'];
    groups[k] = groups[k] || [];
    groups[k].push(o);
  });

  return Object.keys(groups).map(function(group) {
    var sensorId = groups[group][0]['sensor'];
    var obj = {
        "sensor_id": sensorId,
        "label": sensorData[sensorId],
        "data": groups[group]
    };
    return obj;
  });
}

module.exports = router;
