$(function() {
  var data = [];
  for (var i = 0; i < temps.length; i++) {
    data.push([temps[i]['time'] * 1000, temps[i]['temp']]);
  }

  // Plot the temperatures on the graph.
  $.plot("#temps", [ data ], {
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
