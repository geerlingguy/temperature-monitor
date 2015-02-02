$(function() {
  // Some sample data (TODO: Get this from a dynamic source).
  var data = [
    ["02-02-15 12:25:01", 71.94],
    ["02-02-15 12:25:31", 71.82],
    ["02-02-15 12:26:02", 71.94],
    ["02-02-15 12:26:32", 71.94],
    ["02-02-15 12:27:02", 71.94],
    ["02-02-15 12:27:32", 71.94],
    ["02-02-15 12:28:03", 71.94],
    ["02-02-15 12:28:33", 71.94],
    ["02-02-15 12:29:03", 72.05],
    ["02-02-15 12:29:33", 72.05],
    ["02-02-15 12:30:04", 72.05],
    ["02-02-15 12:30:34", 72.05],
    ["02-02-15 12:31:04", 72.05],
    ["02-02-15 12:31:35", 72.16]
  ];
  console.log(data);

  // Convert dates to UNIX timestamps.
  // TODO - Fix data in source instead of transforming it in JS.
  for (var i = 0; i < data.length; i++) {
    data[i][0] = Date.parse(data[i][0]);
  }

  // Plot the temperatures on the graph.
  $.plot("#temps", [ data ], {
    yaxis: { },
    xaxis: {
      mode: "time",
      minTickSize: [1, "minute"],
      timeformat: "%H:%M:%S"
    },
      "lines": {"show": "true"},
      "points": {"show": "true"},
      clickable:true,
      hoverable: true
  });
});
