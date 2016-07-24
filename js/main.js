function draw(data) {
  "use strict";
  var margin = 75,
      width = 1400 - margin,
      height = 600 - margin;

  d3.select("body")
    .append("h2")
    .text("NRL Salary Cap");

  d3.select("body")
      .append("div")
      .text("The National Rugby League (NRL) is Australia's premier rugby league competition. \
        The league in its various forms has been running since 1908.  In 1990, the league \
        introduced a salary cap in an attempt to level the playing field between participating \
        clubs. I've set out to see if the cap had any effect on making the minor premiers \
        of the competition more evenly spread.")
      .attr("class", "intro");

  d3.select("body")
      .append("div")
      .text("The chart shows as a timeseries for each team which is the number of years the club's \
        fans have been waiting to win the minor premiership. The most important thing, right? \
        So, this is the number of seasons since their last win or entered the competion. \
        A value of zero equates to winning the premiership that year. The mean number of years \
        across all teams participating in the current season is also shown.  Finally a series which \
        represents the current winner is shown. \
        You can select an individual team by clicking on the legend.")
      .attr("class", "desc");

  var svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
      .append('g')
      .attr('class', 'chart');

  debugger;
  // Create the chart
  
  // Separate data into summary and team
  var meanAndPrem = dimple.filterData(data, "Team", ["Mean", "Current.Premier"]);

  // Get a unique list of teams
  var teams = dimple.getUniqueValues(data, "Team");
  teams.splice(teams.indexOf("Mean"), 1);
  teams.splice(teams.indexOf("Current.Premier"), 1);

  data = dimple.filterData(data, "Team", teams);

  var simpleChart = new dimple.chart(svg);
  simpleChart.setBounds(margin, margin, 1200, 400);

  var x = simpleChart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 2;

  var y1 = simpleChart.addMeasureAxis("y", "No.Years");
  y1.overrideMin = 0;

  var y2 = simpleChart.addMeasureAxis("y", "No.Years");
  y2.overrideMin = 0;

  var s1 = simpleChart.addSeries("Team", dimple.plot.line, [x, y1]);
  s1.data = meanAndPrem;

  var s2 = simpleChart.addSeries("Team", dimple.plot.line, [x, y2]);
  s2.data = data;

  var legend = simpleChart.addLegend(10, 10, 1200, 80, "right");

  simpleChart.assignColor("Mean", "black");
  simpleChart.assignColor("Current.Premier", "black");
  simpleChart.draw();

  // Dash the mean
  svg.selectAll("path.dimple-mean").style("stroke-dasharray", "2");

  //debugger;

  // Orphan the chart so we can make it interactive
  simpleChart.legends = [];  

  // Legend title
  svg.selectAll("title_text")
    .data(["Click legend to choose team:"])
    .enter()
    .append("text")
      .attr("x", 10)
      .attr("y", 10)
      .style("font-family", "sans-serif")
      .style("font-size", "10px")
      .style("color", "Black")
      .text(function (d) { return d; });

  // Get all the rectangles from our now orphaned legend
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function(e) {

      //debugger;
      // Set all other lines grey and the current selection to its colour
      var selection = e.aggField.slice(-1)[0];
      selection = selection.toLowerCase().replace(/\./g, '-');
      if (selection != "all") {
        teams.forEach(function(iTeam) {
          iTeam = iTeam.toLowerCase().replace(/\./g,'-');
          if (iTeam != selection) {
            d3.select('path.dimple-' + iTeam).style("stroke", "F3EFE0");
          } else {
            d3.select('path.dimple-' + iTeam).style("stroke", e.fill);
          }
        });
      } else {
        // Highlight all teams
      }
      
    });

};