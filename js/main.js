function draw(data) {
  "use strict";

  var svg = d3.select("body")
      .append("svg")
      .attr("width", 1200)
      .attr("height", 600)
      .append('g')
      .attr('class', 'chart');

  // Get a unique list of teams
  var teams = dimple.getUniqueValues(data, "Team");
  teams.splice(teams.indexOf("Mean"), 1);
  teams.splice(teams.indexOf("Current.Premier"), 1);
  
  // Create chart starting with all data to get legend
  var chart = new dimple.chart(svg, data);
  chart.setBounds(50, 150, 1100, 400);

  // x axis
  var x = chart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 2;
  x.fontFamily = 'Roboto';
  x.fontSize = 12;

  // y axis
  var y = chart.addMeasureAxis("y", "No.Years");
  y.fontFamily = 'Roboto';
  y.fontSize = 12;

  // series
  var series = chart.addSeries("Team", dimple.plot.line);
  series.addOrderRule(teams.concat(["Mean","Current.Premier"]));

  // legend
  var legend = chart.addLegend(100, 50, 1100, 100, "left");
  legend.fontSize = 12;
  legend.fontFamily = 'Roboto';

  // Some base colouring for mean and current premier
  chart.assignColor("Mean", "red");
  chart.assignColor("Current.Premier", "black");

  // Now draw!
  chart.draw();

  // Orphan the legend so we can make it interactive
  chart.legends = [];

  // Now filter the chart just to the mean and premier
  var visible = ["Mean", "Current.Premier"];
  series.data = dimple.filterData(data, "Team", visible);
  chart.draw();

  // Code for interactive legend
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function(e) {

      //debugger;
      // Add selected data if not visible, remove otherwise
      var selection = e.aggField.slice(-1)[0];
      var idx = visible.indexOf(selection);
      if (idx === -1) {
        // Not visible so show
        series.data = series.data.concat(dimple.filterData(data, "Team", selection));
        visible.push(selection);
      } else {
        // Already visible so hide
        visible.splice(idx, 1);
        series.data = dimple.filterData(series.data, "Team", visible);        
      }

      chart.draw(800);
        
    });

};