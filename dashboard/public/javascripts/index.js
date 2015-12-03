$(function() {

  // 60s refresh interval.
  var refreshInterval = 60000;

  // Plot temperatures in Flot graph.
  var refreshTemperatureGraph = function() {
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

      // Remove 'loading' class from graph.
      $('#temperature-graph').removeClass('loading');

      // Plot the temperatures on the graph.
      $.plot("#temperature-graph", temp_data, {
        yaxis: {
          tickFormatter: function (v, axis) {
            return v.toFixed(axis.tickDecimals) +"°F ";
          },
        },
        xaxis: {
          mode: "time",
          timeformat: "%I:%M %p",
          timezone: "browser",
          min: start * 1000,
          max: now * 1000
        },
        lines: {show: true},
        legend: {
          show: true,
          position: "sw"
        },
        grid: {
          markings: function (axes) {
            var markings = [];
            console.log(axes);
            for (var y = Math.floor(axes.ymin); y < axes.ymax; y += 2) {
              markings.push({yaxis: { from: y, to: y + 1 }});
            }
            return markings;
          },
          margin: {
            right: 0,
            left: 30
          }
        }
      });
    });
  }

  var refreshLatestTemps = function() {
    $.getJSON('/temps/latest', function(data) {
      var temp_data = [];
      console.log(data);

      $.each(data, function(index, value) {
        // Set up the date.
        var date = new Date();
        date.setTime(value.time * 1000);
        dateString = date.toTimeString().slice(0, 8);

        // Set up the values.
        var title = $('<h3>', {class: 'title'}).text(value.label)
        var temp = $('<div>', {class: 'temperature'}).text(value.temp + '°F')
        var time = $('<div>', {class: 'time'}).text('as of ' + dateString)

        var sensorClass = 'sensor-' + value.sensor_id;
        var sensorDiv = $('#temperature-latest > .' + sensorClass);
        // If the sensor div exists, update the data inside.
        if (sensorDiv.length) {
          sensorDiv.empty().append(title, temp, time);
        }
        // Otherwise, create the div and populate the data.
        else {
          var sensorDivToAdd = $('<div>', {class: 'sensor ' + sensorClass}).append(title, temp, time);
          $('#temperature-latest').append(sensorDivToAdd);
        }
      });

      // Remove 'loading' class from latest temperature area.
      $('#temperature-latest').removeClass('loading');
    });
  }

  var loadData = function() {
    refreshTemperatureGraph();
    refreshLatestTemps();
  }

  // Load the initial data and set up an interval to reload it.
  loadData();
  var interval = window.setInterval(loadData, refreshInterval);
});
