function draw(data) {
  "use strict";
  var margin = 75,
      width = 1400 - margin,
      height = 600 - margin;

  var lightGrey = "F3EFE0";

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

  //debugger;
  // Create the chart
  
  // Separate data into summary and team
  var meanAndPrem = dimple.filterData(data, "Team", ["Mean", "Current.Premier"]);

  // Get a unique list of teams
  var teams = dimple.getUniqueValues(data, "Team");
  teams.splice(teams.indexOf("Mean"), 1);
  teams.splice(teams.indexOf("Current.Premier"), 1);

  var teamData = dimple.filterData(data, "Team", teams);

  var simpleChart = new dimple.chart(svg, data);
  simpleChart.setBounds(margin, margin, 1200, 400);

  var x = simpleChart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 2;

  var y = simpleChart.addMeasureAxis("y", "No.Years");
  y.overrideMin = 0;

  var s = simpleChart.addSeries("Team", dimple.plot.line);
  //s.lineMarkers= true;
  s.addOrderRule(teams.concat(["Mean","Current.Premier"]));

  var legend = simpleChart.addLegend(10, 10, 1200, 80, "left");

  // Some base colouring
  simpleChart.assignColor("Mean", "black");
  simpleChart.assignColor("Current.Premier", "black");
  simpleChart.draw();

  // Apply some extra colouring
  svg.selectAll("path").style("stroke", lightGrey);
  svg.selectAll("path.dimple-current-premier").style("stroke", "black");
  svg.selectAll("path.dimple-mean")
    .style("stroke-dasharray", "2")
    .style("stroke", "black")

  svg.selectAll(".dimple-marker,.dimple-marker-back")
    .attr("r", 2)
    .style("stroke", lightGrey)

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
  var visible = [];
  legend.shapes.selectAll("rect")
    // Add a click event to each rectangle
    .on("click", function(e) {

      //debugger;
      // Set all other lines grey and the current selection to its colour
      var selection = e.aggField.slice(-1)[0];
      var sel = selection.toLowerCase().replace(/\./g, '-');

      if (selection != "all") {
        
        var idx = visible.indexOf(sel);
        if (idx === -1) {
          // Not visible so show
          d3.select('path.dimple-' + sel).style("stroke", e.fill);
          visible.push(sel);
          //debugger;
          // Bring selection to the front - THIS DOESN'T WORK
          //teams.splice(teams.indexOf(selection), 1);
          //teams.push(selection);          
          //s.addOrderRule(teams.concat(["Mean","Current.Premier"]));
          //s._orderRules.shift();
        } else {
          // Already visible so hide
          d3.select('path.dimple-' + sel).style("stroke", lightGrey);
          visible.splice(idx, 1);
        }

      } else {
        // Turn on/off all
      }

      //simpleChart.draw(600, true);
        
    });

};