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
  teams.splice(teams.indexOf("Show All"), 1);
  teams.splice(teams.indexOf("Reset"), 1);
  var teamsPlus = teams.slice();
  teams.splice(teams.indexOf("Mean"), 1);
  teams.splice(teams.indexOf("Winner"), 1);  
  
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
  series.addOrderRule(teams.concat(["Mean","Winner","Show All","Reset"]));

  // legend
  var legend = chart.addLegend(100, 50, 1100, 100, "left");
  legend.fontSize = 12;
  legend.fontFamily = 'Roboto';

  // Colouring for mean and current premier
  chart.assignColor("Mean", "red");
  chart.assignColor("Winner", "black");
  chart.assignColor("Show All", "white");
  chart.assignColor("Reset", "white");

  // Add custom tooltip
  series.getTooltipText = function(e) {
    var str = []
    if (e.aggField[0] === 'Winner') {
        // figure out the premier - this isn't very nice
        //debugger;
        for (var i = 0; i < this.x.chart.data.length; i++) {
          if (this.x.chart.data[i]["No.Years"] == 0) {
            // It's a winner, but which year?
            var d = new Date(e.x);
            if (this.x.chart.data[i]["Season"] == d.getFullYear()) {
              // Found it!
              str.push(this.x.chart.data[i]["Team"]);
              break;
            }
          }
        }
    } else {
        str.push(e.aggField[0]);
    }
    var d = new Date(e.x);
    str.push("Season: " + d.getFullYear());
    str.push("No. Years: " + Math.round(e.y * 100)/100);
    return str;
  };

  // Now draw!
  chart.draw();

  // Orphan the legend so we can make it interactive
  chart.legends = [];

  // Now filter the chart just to the mean and premier
  var baseData = dimple.filterData(data, "Team", ["Mean", "Winner"]);
  series.data = baseData;
  chart.draw();

  //debugger;

  // Code for interactive legend
  var visible = [];
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function(e) {

      //debugger;
      // Add selected data if not visible, remove otherwise
      var selection = e.aggField.slice(-1)[0];
      if (selection === "Show All") {
        series.data = dimple.filterData(data, "Team", teamsPlus);
        visible = teams;
      } else if (selection === "Reset") {
        series.data = baseData;
        visible = [];
      } else {
        var idx = visible.indexOf(selection);
        if (idx === -1) {
          // Not visible so show
          series.data = series.data.concat(dimple.filterData(data, "Team", selection));
          visible.push(selection);
        } else {
          // Already visible so hide
          visible.splice(idx, 1);
          series.data = baseData;
        }
      }

      chart.draw(800);
        
    });

};