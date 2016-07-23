function draw(data) {
  "use strict";
  var margin = 75,
      width = 1400 - margin,
      height = 600 - margin;

  d3.select("body")
    .append("h2")
    .text("NRL");

  var svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
      .append('g')
      .attr('class', 'chart');

  //debugger;
  //data = dimple.filterData(data, "Team", ["mean", "Eastern.Suburbs"]);
  var simpleChart = new dimple.chart(svg, data);
  simpleChart.setBounds(margin, margin, 1200, 400);
  var x = simpleChart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 4;
  simpleChart.addMeasureAxis("y", "No.Years");
  var s = simpleChart.addSeries("Team", dimple.plot.line);
  simpleChart.addLegend(60, 10, 1200, 80, "right");
  simpleChart.draw();

};
