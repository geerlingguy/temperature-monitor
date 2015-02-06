$(function() {

  // 30s refresh interval.
  var refreshInterval = 30000;

  // Plot temperatures in Flot graph.
  var refreshTemps = function() {
    // Get time 24h ago.
    var now = Math.round(new Date().getTime() / 1000);
    var start = now - (24 * 3600);

    // Load temperature data through AJAX.
    $.getJSON('/temps/all', { startTime: start }, function(data) {
      var temp_data = [];
      for (var i = 0; i < data.length; i++) {
        temp_data[i] = {
          'label': data[i]['label'],
          'data': []
        };
        for (var j = 0; j < data[i]['data'].length; j++) {
          var dataPoint = [data[i]['data'][j]['time'] * 1000, data[i]['data'][j]['temp']];
          temp_data[i]['data'].push(dataPoint);
        };
      }

      // Plot the temperatures on the graph.
      $.plot("#temps", temp_data, {
        yaxis: {
          tickFormatter: function (v, axis) {
            return v.toFixed(axis.tickDecimals) +"°F "
          }
        },
        xaxis: {
          mode: "time",
          timeformat: "%I:%M:%S %p",
          timezone: "browser",
          min: start * 1000,
          max: now * 1000
        },
        "lines": {"show": "true"},
      });
    });
  }

  // Load the graph on page load.
  refreshTemps();

  // Refresh the page at a given interval.
  var interval = window.setInterval(refreshTemps, refreshInterval);

});
