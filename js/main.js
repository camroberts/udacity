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
  var legend = simpleChart.addLegend(60, 10, 1200, 80, "right");
  simpleChart.draw();

  // This is a critical step.  By doing this we orphan the legend. This
  // means it will not respond to graph updates.  Without this the legend
  // will redraw when the chart refreshes removing the unchecked item and
  // also dropping the events we define below.
  simpleChart.legends = [];  

  // This block simply adds the legend title. I put it into a d3 data
  // object to split it onto 2 lines.  This technique works with any
  // number of lines, it isn't dimple specific.
  svg.selectAll("title_text")
    .data(["Click legend to","show/hide owners:"])
    .enter()
    .append("text")
      .attr("x", 499)
      .attr("y", function (d, i) { return 90 + i * 14; })
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .style("color", "Black")
      .text(function (d) { return d; });  

  // Get a unique list of Owner values to use when filtering
  var filterValues = dimple.getUniqueValues(data, "Team");
  // Get all the rectangles from our now orphaned legend
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function (e) {
      // This indicates whether the item is already visible or not
      var hide = false;
      var newFilters = [];
      // If the filters contain the clicked shape hide it
      filterValues.forEach(function (f) {
        if (f === e.aggField.slice(-1)[0]) {
          hide = true;
        } else {
          newFilters.push(f);
        }
      });
      // Hide the shape or show it
      if (hide) {
        d3.select(this).style("opacity", 0.2);
      } else {
        newFilters.push(e.aggField.slice(-1)[0]);
        d3.select(this).style("opacity", 0.8);
      }
      // Update the filters
      filterValues = newFilters;
      // Filter the data
      simpleChart.data = dimple.filterData(data, "Team", filterValues);
      // Passing a duration parameter makes the chart animate. Without
      // it there is no transition
      simpleChart.draw(800);
    });

};
