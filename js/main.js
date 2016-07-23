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
  var simpleChart = new dimple.chart(svg, data);
  simpleChart.setBounds(margin, margin, 1200, 400);
  var x = simpleChart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 4;
  var y = simpleChart.addMeasureAxis("y", "No.Years");
  y.overrideMin = 0;
  var s = simpleChart.addSeries("Team", dimple.plot.line);
  var legend = simpleChart.addLegend(60, 10, 1200, 80, "right");
  simpleChart.assignColor("mean", "black");
  simpleChart.draw();

  //debugger;

  // This is a critical step.  By doing this we orphan the legend. This
  // means it will not respond to graph updates.  Without this the legend
  // will redraw when the chart refreshes removing the unchecked item and
  // also dropping the events we define below.
  simpleChart.legends = [];  

  // This block simply adds the legend title. I put it into a d3 data
  // object to split it onto 2 lines.  This technique works with any
  // number of lines, it isn't dimple specific.
  svg.selectAll("title_text")
    .data(["Click legend to choose team:"])
    .enter()
    .append("text")
      .attr("x", 499)
      .attr("y", function (d, i) { return 90 + i * 14; })
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .style("color", "Black")
      .text(function (d) { return d; });  

  // Get a unique list of teams
  var teams = dimple.getUniqueValues(data, "Team");

  // Get all the rectangles from our now orphaned legend
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function(e) {

      //debugger;
      // Set all lines grey and the selection to its colour
      var selection = e.aggField.slice(-1)[0];
      selection = selection.toLowerCase().replace(/\./g, '-');
      if (selection != "all") {
        teams.forEach(function(iTeam) {
          iTeam = iTeam.toLowerCase().replace(/\./g,'-');
          if (iTeam != selection) {
            d3.select('path.dimple-' + iTeam).style("stroke", "grey");
          } else {
            d3.select('path.dimple-' + iTeam).style("stroke", e.fill);
          }
        });
      } else {

      }
      
    });

};