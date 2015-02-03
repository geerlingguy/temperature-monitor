$(function() {
  // Load temperature data through AJAX.
  $.getJSON('/temps', function(data) {
    var temps = [];
    for (var i = 0; i < data.length; i++) {
      temps.push([data[i]['time'] * 1000, data[i]['temp']]);
    }

    // Plot the temperatures on the graph.
    $.plot("#temps", [ temps ], {
      yaxis: {
        tickFormatter: function (v, axis) {
          return v.toFixed(axis.tickDecimals) +"°F "
        }
      },
      xaxis: {
        mode: "time",
        timeformat: "%I:%M:%S %p",
        timezone: "browser"
      },
      "lines": {"show": "true"},
    });
  });
});
