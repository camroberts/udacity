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

debugger;
var simpleChart = new dimple.chart(svg, data);
var x = simpleChart.addTimeAxis("x", "Year", "%Y", "%Y"); 
simpleChart.addMeasureAxis("y", "mean");
//x.timeInterval = 4;
simpleChart.addSeries("Mean", dimple.plot.line);
simpleChart.draw();      

};
