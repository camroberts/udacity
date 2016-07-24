function draw(data) {
  "use strict";
  //var margin = 100,
   //   width = 1400 - margin,
   //   height = 600 - margin;

  var lightGrey = "F3EFE0";

  d3.select("body")
    .append("h1")
    .text("NRL Salary Cap");

  d3.select("body").append("div").attr("class", "intro");

  d3.select(".intro")
      .append("p")
      .text("The National Rugby League (NRL) is Australia's premier rugby league competition. \
        The league in its various forms has been running since 1908.  In 1990, the league \
        introduced a salary cap in an attempt to level the playing field between participating \
        clubs. I've set out to see if the cap made the competition more even by investigating the \
        which teams have won the minor premiership over the past fifty years.");

  d3.select(".intro")
      .append("p")
      .text("The chart shows as a timeseries for each team which is the number of years the club's \
        fans have been waiting to win the minor premiership. (The most important thing, right?) \
        So, this is the number of seasons since their last win or when they entered the competion. \
        A value of zero equates to winning the premiership that year. The mean number of years \
        across all teams participating in the current season is also shown.  Finally a series which \
        represents the current winner is shown.");

  d3.select(".intro")
      .append("p")
      .text("You can toggle individual teams by clicking on the legend.");

  var svg = d3.select("body")
      .append("svg")
      .attr("width", 1200)
      .attr("height", 600)
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
  simpleChart.setBounds(50, 100, 1100, 400);

  var x = simpleChart.addTimeAxis("x", "Season", "%Y", "%Y"); 
  x.timeInterval = 2;

  var y = simpleChart.addMeasureAxis("y", "No.Years");
  y.overrideMin = 0;

  var s = simpleChart.addSeries("Team", dimple.plot.line);
  //s.lineMarkers= true;
  s.addOrderRule(teams.concat(["Mean","Current.Premier"]));

  var legend = simpleChart.addLegend(100, 20, 1100, 100, "left");
  legend.fontSize = 12;
  legend.fontFamily = 'Roboto';

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
  //svg.selectAll("title_text")
  //  .data(["Click legend to choose team:"])
  //  .enter()
  //  .append("text")
  //    .attr("x", 100)
  //    .attr("y", 10)
  //    .style("font-family", "Roboto")
  //    .style("font-size", "12px")
  //    .style("color", "Black")
  //    .text(function (d) { return d; });

  // Code for interactive legend
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